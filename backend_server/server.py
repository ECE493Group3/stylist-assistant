from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from tempfile import SpooledTemporaryFile
import urllib
import os
import sys
import cgi

PORT = 8000

class ServerHTTP(BaseHTTPRequestHandler):

	def do_GET(self):
		path = self.path
		print(path)

		query = urllib.splitquery(path)
		print(query)

		if(path == "/"):
			self.send_response(200)
			self.send_header("Content-type", "text/html")
			self.send_header("test", "This is test!")
			self.end_headers()

			buf = 	'''
					<!DOCTYPE HTML>
					<head><title>Get Page</title></head>
					<body>
						<h1>Directory</h1>
					</body>
					</html>
					'''
			self.wfile.write(buf)
		else:
			imgname = self.path[1:]
			print("File request is: "+ imgname)

			if os.path.exists(imgname):
				imgfile = open(imgname, 'rb').read()
				self.send_response(200)
				# self.send_header('Content-type', 'image/jpg')
				self.send_header('Content-length', sys.getsizeof(imgfile))
				self.end_headers()
				self.wfile.write(imgfile)

			else:
				self.send_response(404)

			print("End of Get request")

	def do_POST(self):
		print("Post Request")
		path = self.path
		print(path)

		# import pdb; pdb.set_trace()
		query = urllib.splitquery(path)
		print(query)

		# if(self.path != "/"):
		length = int(self.headers.getheader('Content-length', 0))
		# length = int(self.headers['Content-length'])
		
		data = urllib.unquote(self.rfile.read(int(length)))
		print("length: " + str(length))

		with open(path[1:], 'wb') as imgfile:
			
			imgfile.write(data)

		self.send_response(200)
		self.send_header("test", "this")
		self.end_headers()

		print("End of POST Request")

if __name__ == '__main__':
	http_server = HTTPServer(('', PORT), ServerHTTP)
	http_server.serve_forever()
