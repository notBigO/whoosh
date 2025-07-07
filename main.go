package main

import (
	"context"
	"log"
	"sync"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/routing"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery/mdns"
)

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

func main() {
	ctx := context.Background()
	var kadDHT *dht.IpfsDHT

	host, err := libp2p.New(
		// listen to all available network intefaces (for now. will change later)
		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0", "/ip4/0.0.0.0/udp/0/quic-v1"),

		// websocket support for web browsers
		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/4002/ws"),

		// use DHT based routing
		libp2p.Routing(func(h host.Host) (routing.PeerRouting, error) {
			var err error
			kadDHT, err = dht.New(ctx, h, dht.Mode(dht.ModeServer))
			return kadDHT, err
		}),

		// fallback relay to access networks hidden behind NAT
		libp2p.EnableRelayService(),

		// enable hole punching as another mechanism
		libp2p.EnableHolePunching(),
	)

	if err != nil {
		log.Fatalf("Failed to create libp2p host: %v", err)
	}

	// we'll setup mDNS for local discovery along with DHT to get the best of both worlds (DHT + mDNS)
	// Create a custom notifee that implements the mdns.Notifee interface
	notifee := &discoveryNotifee{host: host, ctx: ctx}
	if err := mdns.NewMdnsService(host, "local-discovery", notifee).Start(); err != nil {
		log.Printf("Error setting up mDNS: %v", err)
	}

	// bootstrap DHT

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
	log.Println("Node is ready. Press Ctrl+C to stop.")

	// Keep the program running
	select {}
}
