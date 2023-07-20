package websocket

import (
	"context"
	"crypto/tls"
	"fmt"
	"reflect"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"golang.org/x/net/websocket"
)

var Logger = log.DefaultLogger

type Client struct {
	conn      *websocket.Conn
	serverURL string
	stopChan  chan struct{}
}

type Options struct {
	URI string `json:"uri"`
}

func NewClient(serverURL string) *Client {
	return &Client{serverURL: serverURL}
}

func (c *Client) Connect() error {
	conn, err := c.createConnection()
	if err != nil {
		return fmt.Errorf("error connecting to WebSocket server: %v", err)
	}

	c.conn = conn
	c.stopChan = make(chan struct{})
	return nil
}

func (c *Client) CanConnect() bool {
	conn, err := c.createConnection()
	if err != nil {
		return false
	}
	conn.Close() // Close the temporary connection
	return true
}

func (c *Client) createConnection() (*websocket.Conn, error) {
	config, err := websocket.NewConfig(c.serverURL, "http://localhost")
	if err != nil {
		return nil, err
	}
	config.TlsConfig = &tls.Config{InsecureSkipVerify: true} // For testing with self-signed certificates
	conn, err := websocket.DialConfig(config)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func (c *Client) Read(ctx context.Context) <-chan string {
	messages := make(chan string)
	go func() {
		defer close(messages)
		for {
			select {
			case <-c.stopChan:
				return
			case <-ctx.Done():
				return
			default:
				var message string
				err := websocket.Message.Receive(c.conn, &message)
				// returning on any error for simplicity
				if err != nil {
					Logger.Error("Error reading message", "error", err, "error-type", reflect.TypeOf(err))
					return
				}
				messages <- message
			}
		}
	}()
	return messages
}

func (c *Client) Close() {
	if c.conn == nil {
		return
	}

	if err := c.conn.Close(); err != nil {
		Logger.Error("Error closing connection: %v", err)
	}
	close(c.stopChan)
}

func (c *Client) SendMessage(message string) error {
	return websocket.Message.Send(c.conn, message)
}
