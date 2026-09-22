#!/usr/bin/env python3
"""Serve the course locally so lesson pages can read and record progress.

    python3 tools/serve.py            # then open http://localhost:8000
    python3 tools/serve.py --port 9000

Endpoints (used by assets/engine.js):
  GET  /api/state    progress + due reviews + frontier
  POST /api/record   {"topic": "F01", "kind": "learn|review|diagnose", "result": "pass|fail", "note": "..."}

All writes go through tools/srs.py, so chat sessions and the pages share progress.json.
"""
import argparse
import functools
import json
import sys
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import srs  # noqa: E402


class Handler(SimpleHTTPRequestHandler):
    def _json(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/api/state":
            graph, topics, progress = srs.load()
            today = date.today()
            ready, probe, above = srs.frontier_items(graph, progress)
            return self._json(200, {
                "today": today.isoformat(),
                "progress": progress["topics"],
                "due": srs.due_items(topics, progress, today),
                "ready": ready, "diagnose": probe, "unverifiedAbove": above,
            })
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/record":
            return self._json(404, {"error": "not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            tid, kind, result = body["topic"], body["kind"], body.get("result", "pass")
            graph, topics, progress = srs.load()
            if tid not in topics or kind not in ("learn", "review", "diagnose") or result not in ("pass", "fail"):
                return self._json(400, {"error": "bad topic/kind/result"})
            srs.record(topics, progress, tid, result == "pass", date.today(),
                       "lesson" if kind == "learn" else kind, body.get("note"))
            srs.save(progress)
            return self._json(200, {"topic": tid, "state": progress["topics"][tid]})
        except (ValueError, KeyError) as e:
            return self._json(400, {"error": str(e)})

    def log_message(self, fmt, *args):
        """Log API calls and errors; stay quiet about ordinary static-file hits.

        Note: args[0] is not always a string (send_error passes an HTTPStatus),
        so format first and match on the message.
        """
        try:
            msg = fmt % args
        except (TypeError, ValueError):
            msg = " ".join(str(a) for a in (fmt,) + args)
        if "/api/" in msg or "code 4" in msg or "code 5" in msg:
            sys.stderr.write("%s - %s\n" % (self.address_string(), msg))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    a = ap.parse_args()
    handler = functools.partial(Handler, directory=str(srs.ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", a.port), handler)
    print(f"DSA course at http://localhost:{a.port}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
