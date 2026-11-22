"""
librmanage_service.py — Localhost HTTP/JSON-RPC Service (127.0.0.1:5820)
Decouples Calibre Python engine from AGPL-3.0 koodo-reader UI shell.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from metadata_bridge import MetadataBridge
from convert_worker import ConvertWorker
from query_engine import QueryEngine

bridge = MetadataBridge()
converter = ConvertWorker()


class LibrmanageHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}

        if self.path == "/api/metadata/extract":
            file_path = body.get("filePath")
            meta = bridge.extract_embedded_metadata(file_path)
            self._send_json({"success": True, "metadata": meta})

        elif self.path == "/api/metadata/save":
            book_data = body.get("book")
            sidecar_path = body.get("sidecarPath")
            embed = body.get("embedBinary", False)
            ok = bridge.write_metadata_to_yaml_sidecar(book_data, sidecar_path)
            if embed and book_data.get("filePath"):
                bridge.embed_metadata_into_book(book_data["filePath"], book_data)
            self._send_json({"success": ok})

        elif self.path == "/api/convert":
            in_file = body.get("inputFile")
            res = converter.convert_to_epub3(in_file)
            self._send_json(res)

        elif self.path == "/api/query/filter":
            catalog = body.get("catalog", [])
            query_str = body.get("query", "")
            filtered = [b for b in catalog if QueryEngine.evaluate_expression(b, query_str)]
            self._send_json({"success": True, "results": filtered})

        else:
            self._send_json({"error": "Endpoint not found"}, status=404)


def run_server(port=5820):
    server = HTTPServer(("127.0.0.1", port), LibrmanageHandler)
    print(f"🐾 Kittlibr librmanage Calibre Engine running at http://127.0.0.1:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
