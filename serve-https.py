#!/usr/bin/env python3
"""Local HTTPS dev server for testing on iPhone (speech recognition needs HTTPS)."""

import http.server
import os
import socketserver
import ssl

PORT = 8443
HERE = os.path.dirname(os.path.abspath(__file__))
CERT = os.path.join(HERE, "dev-cert.pem")
KEY = os.path.join(HERE, "dev-key.pem")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    if not os.path.exists(CERT) or not os.path.exists(KEY):
        raise SystemExit("Missing dev-cert.pem / dev-key.pem. Run openssl to generate them first.")

    os.chdir(HERE)
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(CERT, KEY)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f"Serving HTTPS on port {PORT}")
        print(f"Open on iPhone: https://<your-mac-ip>:{PORT}/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()