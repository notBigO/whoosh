package main

import (
	"context"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
	"github.com/libp2p/go-libp2p/core/routing"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	"github.com/libp2p/go-libp2p/p2p/net/connmgr"
	ma "github.com/multiformats/go-multiaddr"
)

// custom protocol to differentiate between actual client peers and bootstrap peers (handshake initiation)
const whooshClientProtocol = protocol.ID("/whoosh/client-hello/1.0")

// discoveryNotifee implements the mdns.Notifee interface
type discoveryNotifee struct {
	host host.Host
	ctx  context.Context
}

// HandlePeerFound implements the mdns.Notifee interface
func (n *discoveryNotifee) HandlePeerFound(info peer.AddrInfo) {
	log.Printf("Found peer via mDNS: %s", info.ID)
	if err := n.host.Connect(n.ctx, info); err != nil {
		log.Printf("Failed to connect to peer %s: %v", info.ID, err)
	} else {
		log.Printf("Successfully connected to peer %s", info.ID)
	}
}

// loadOrCreateIdentity loads a private key from a file if it exists,
// or generates a new one and saves it to the file. This ensures the host
// has a stable PeerId.
func loadOrCreateIdentity(path string) (crypto.PrivKey, error) {
	// Check if the key file already exists.
	if _, err := os.Stat(path); err == nil {
		// If it exists, read the key from the file using os.ReadFile.
		keyBytes, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		// Unmarshal the raw bytes into a private key.
		privKey, err := crypto.UnmarshalPrivateKey(keyBytes)
		if err != nil {
			return nil, err
		}
		log.Printf("Loaded existing private key from %s", path)
		return privKey, nil
	}

	// If the key file does not exist, generate a new one.
	log.Printf("Generating new private key at %s", path)
	privKey, _, err := crypto.GenerateKeyPair(crypto.Ed25519, -1)
	if err != nil {
		return nil, err
	}

	// Marshal the private key to raw bytes.
	keyBytes, err := crypto.MarshalPrivateKey(privKey)
	if err != nil {
		return nil, err
	}

	// Save the key to a file with read-only permissions for the owner
	if err := os.WriteFile(path, keyBytes, 0400); err != nil {
		return nil, err
	}

	return privKey, nil
}

// called whenever a peer opens a stream using our custom protocol
func handleWhooshClientStream(s network.Stream) {
	go func() {
		defer s.Close()

		// Read the handshake message from the client
		buf := make([]byte, 256)
		n, err := s.Read(buf)
		if err != nil {
			log.Printf("❌ Error reading handshake from %s: %v", s.Conn().RemotePeer(), err)
			return
		}

		if n > 0 {
			msg := string(buf[:n])
			whooshClientDeviceName := strings.Split(msg, " - ")[1]

			// Send a response back to acknowledge the handshake
			response := "Hello from Whoosh Backend, " + whooshClientDeviceName
			if _, err := s.Write([]byte(response)); err != nil {
				log.Printf("❌ Error sending handshake response to %s: %v", s.Conn().RemotePeer(), err)
				return
			}

		}

		// Wait for the client to close the stream or handle additional messages
		for {
			n, err := s.Read(buf)
			if err != nil {
				if err.Error() == "EOF" {
					log.Printf("Client %s completed handshake and closed connection gracefully", s.Conn().RemotePeer())
				} else {
					log.Printf("❌ Error reading from %s: %v", s.Conn().RemotePeer(), err)
				}
				return
			}

			if n > 0 {
				// Handle any additional messages if needed
				msg := string(buf[:n])
				log.Printf("Additional message from %s: %s", s.Conn().RemotePeer(), msg)
			}
		}
	}()
}

func main() {
	ctx := context.Background()
	var kadDHT *dht.IpfsDHT

	privKey, err := loadOrCreateIdentity("whoosh_identity.key")
	if err != nil {
		log.Fatalf("failed to create private key: %s", err)
	}

	cm, err := connmgr.NewConnManager(
		100,
		400,
		connmgr.WithGracePeriod(time.Minute),
	)
	if err != nil {
		log.Fatalf("Failed to create connection manager: %v", err)
	}

	host, err := libp2p.New(
		libp2p.Identity(privKey),

		// listen to all available network intefaces (for now. will change later)
		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0", "/ip4/0.0.0.0/udp/0/quic-v1", "/ip4/0.0.0.0/tcp/4002/ws"),

		libp2p.AddrsFactory(func(addrs []ma.Multiaddr) []ma.Multiaddr {
			publicAddr, err := ma.NewMultiaddr("/ip4/13.235.69.64/tcp/4002/ws")
			if err != nil {
				log.Printf("❌ Failed to create public multiaddr: %v", err)
				return addrs
			}

			// You can include the default addresses too, if you want
			return append(addrs, publicAddr)
		}),

		// use DHT based routing
		libp2p.Routing(func(h host.Host) (routing.PeerRouting, error) {
			var err error
			kadDHT, err = dht.New(ctx, h, dht.Mode(dht.ModeServer))
			return kadDHT, err
		}),

		libp2p.ConnectionManager(cm),

		// fallback relay to access networks hidden behind NAT
		libp2p.EnableRelayService(),

		// enable hole punching as another mechanism
		libp2p.EnableHolePunching(),
	)
	if err != nil {
		log.Fatalf("Failed to create libp2p host: %v", err)
	}
	defer host.Close()

	// setup the stream handler for our custom protocol
	host.SetStreamHandler(whooshClientProtocol, handleWhooshClientStream)

	// setup mDNS for local discovery along with DHT to get the best of both worlds (DHT + mDNS)
	// Create a custom notifee that implements the mdns.Notifee interface
	notifee := &discoveryNotifee{host: host, ctx: ctx}
	if err := mdns.NewMdnsService(host, "whoosh-local", notifee).Start(); err != nil {
		log.Printf("Error setting up mDNS: %v", err)
	}

	// store all bootstrapped peers.
	bootstrapPeers := dht.DefaultBootstrapPeers
	var wg sync.WaitGroup

	log.Println("Bootstrapping DHT")
	for _, addr := range bootstrapPeers {
		// convert MultiAddr to AddrInfo
		pi, _ := peer.AddrInfoFromP2pAddr(addr)
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := host.Connect(ctx, *pi); err != nil {
				log.Printf("Warning: Failed to connect to bootstrap peer %s: %v", pi.ID, err)
			} else {
				log.Printf("Connection established with bootstrap peer: %s", pi.ID)
			}
		}()
	}
	wg.Wait()
	log.Println("DHT Bootstrap complete.")

	log.Printf("Whoosh backend node is running!")
	log.Printf("Peer ID: %s", host.ID())
	log.Println("Listening on addresses:")
	for _, addr := range host.Addrs() {
		log.Printf("    - %s/p2p/%s", addr, host.ID())
	}

	// Keep the program running
	select {}
}
