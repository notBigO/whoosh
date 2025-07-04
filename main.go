package main

import (
	"fmt"

	"github.com/libp2p/go-libp2p"
)

func main() {
	host, err := libp2p.New()
	if err != nil {
		fmt.Errorf("error creating host %w", err)
	}
	fmt.Printf("Created libp2p host: %s", host.Addrs())
}
