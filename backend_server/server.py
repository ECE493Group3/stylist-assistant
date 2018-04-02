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

			# Retrieve user email
			imgname = query[0][1:]

			parameters = query[1].split("=")
			email = parameters[1]


			print("File request is: "+ imgname + " username: " + email)

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
		imgname = query[0][1:]

		parameters = query[1].split("=")
		email = parameters[1]

		length = int(self.headers.getheader('Content-length', 0))
		
		data = urllib.unquote(self.rfile.read(int(length)))
		print("length: " + str(length) + " username: " + email)

		with open(imgname, 'wb') as imgfile:
			
			imgfile.write(data)

		self.send_response(200)
		self.send_header("test", "this")
		self.end_headers()

		print("End of POST Request")

		buf = "IMAGEURL"
		self.wfile.write(buf)

		print("Send out buf: " + buf)



if __name__ == '__main__':
	http_server = HTTPServer(('', PORT), ServerHTTP)
	http_server.serve_forever()
