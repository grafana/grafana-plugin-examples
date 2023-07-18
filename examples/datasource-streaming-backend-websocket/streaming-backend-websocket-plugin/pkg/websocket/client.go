package websocket

import (
	"crypto/tls"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"golang.org/x/net/websocket"
)

var Logger = log.DefaultLogger

type Client struct {
	conn *websocket.Conn
}

type Options struct {
	URI string `json:"uri"`
}

func NewClient(serverURL string) (*Client, error) {
	config, err := websocket.NewConfig(serverURL, "http://localhost")
	if err != nil {
		return nil, fmt.Errorf("error creating WebSocket config: %v", err)
	}
	// use self-signed certificate for this test example
	config.TlsConfig = &tls.Config{InsecureSkipVerify: true}
	conn, err := websocket.DialConfig(config)
	if err != nil {
		return nil, fmt.Errorf("error connecting to WebSocket server: %v", err)
	}

	return &Client{conn: conn}, nil
}

func (c *Client) Read() <-chan string {
	messages := make(chan string)
	go func() {
		defer close(messages)
		for {
			var message string
			err := websocket.Message.Receive(c.conn, &message)
			if err != nil {
				Logger.Info("Error reading message: %v", err)
				continue
			}
			messages <- message
		}
	}()
	return messages
}

func (c *Client) Close() {
	if err := c.conn.Close(); err != nil {
		panic(err)
	}
}

func (c *Client) SendMessage(message string) error {
	return websocket.Message.Send(c.conn, message)
}

func (c *Client) IsConnected() bool {
	return c.conn != nil
}
