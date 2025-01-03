package websocket

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
}

func NewClient(url string) (*Client, error) {
	c := &Client{}

	// Connect to the WebSocket server
	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return nil, err
	}

	c.conn = conn
	return c, nil
}

func (c *Client) ReadMessage() ([]byte, error) {
	_, msg, err := c.conn.ReadMessage()
	if err != nil {
		return nil, err
	}
	return msg, nil
}

func (c *Client) Close() error {
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}

func (c *Client) WriteMessage(message []byte) error {
	return c.conn.WriteMessage(websocket.TextMessage, message)
}
