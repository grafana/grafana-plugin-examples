package plugin

/**
With openssl command:
# echo -n "string to sign" | openssl rsautl -inkey private.key -sign|base64
or with openssl + sha256 (if it is used SignSHA256 function)
# openssl dgst -sha256 -sign private.key -out sign.txt.sha256 <(echo -n "string to sign") ; cat sign.txt.sha256 | base64
With sign.go
# go run sign.go -word="string to sign"
Both commands should produce the same results.
*/

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
)

// A Signer is can create signatures that verify against a public key.
type Signer interface {
	// Sign returns raw signature for the given data. This method
	// will apply the hash specified for the key type to the data.
	SignSHA256(data []byte) ([]byte, error)
}

type rsaPrivateKey struct {
	*rsa.PrivateKey
}

// Sign signs data with rsa-sha256
func (r *rsaPrivateKey) SignSHA256(data []byte) ([]byte, error) {
	h := sha256.New()
	h.Write(data)
	d := h.Sum(nil)
	return rsa.SignPKCS1v15(rand.Reader, r.PrivateKey, crypto.SHA256, d)
}

type ecdsaPrivateKey struct {
	*ecdsa.PrivateKey
}

// Sign signs data with rsa-sha256
func (r *ecdsaPrivateKey) SignSHA256(data []byte) ([]byte, error) {
	h := sha256.New()
	h.Write(data)
	d := h.Sum(nil)

	rr, s, err := ecdsa.Sign(rand.Reader, r.PrivateKey, d)
	if err != nil {
		panic(err)
	}

	keyBytes := 32

	rBytes := rr.Bytes()
	rBytesPadded := make([]byte, keyBytes)
	copy(rBytesPadded[keyBytes-len(rBytes):], rBytes)

	sBytes := s.Bytes()
	sBytesPadded := make([]byte, keyBytes)
	copy(sBytesPadded[keyBytes-len(sBytes):], sBytes)

	return append(rBytesPadded, sBytesPadded...), nil
}

func loadPrivateKey(key string) (Signer, error) {
	return ParsePrivateKey([]byte(key))
}

// parsePublicKey parses a PEM encoded private key.
func ParsePrivateKey(pemBytes []byte) (Signer, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("crypto: no key found")
	}

	var rawkey interface{}
	switch block.Type {
	case "RSA PRIVATE KEY":
		rsa, err := x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		rawkey = rsa
	case "PRIVATE KEY":
		ecdsa, err := x509.ParsePKCS8PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
		rawkey = ecdsa
	default:
		return nil, fmt.Errorf("crypto: unsupported private key type %q", block.Type)
	}
	return newSignerFromKey(rawkey)
}

func newSignerFromKey(k interface{}) (Signer, error) {
	var sshKey Signer
	switch t := k.(type) {
	case *rsa.PrivateKey:
		sshKey = &rsaPrivateKey{t}
	case *ecdsa.PrivateKey:
		sshKey = &ecdsaPrivateKey{t}
	default:
		return nil, fmt.Errorf("crypto: unsupported key type %T", k)
	}
	return sshKey, nil
}
