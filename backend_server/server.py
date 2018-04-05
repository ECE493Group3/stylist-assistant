from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from tempfile import SpooledTemporaryFile
import urllib
import os
import sys
import cgi
import base64
from image_processor import ImageProcessor
from connect_firebase import *
from cloth import Cloth, Outfit, FULLBODY, COMBINATIONS
from cloth_similarity import *
from cloth_hierarchy import *

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

			#parameters = query[1].split("=")
			#email = parameters[1]


			#print("File request is: "+ imgname + " username: " + email)

			if os.path.exists(imgname):
				imgfile = open(imgname, 'rb').read()
				self.send_response(200)
				content = "<img src='{0}' />".format(imgfile)
				#self.send_header('Content-type', 'text/html')			
				#self.send_header('Content-length', str(len(content)))
				self.send_header("Access-Control-Allow-Origin", "*")
				self.end_headers()
				self.wfile.write(content)
				print("File length: " + str(sys.getsizeof(content)))
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
		imgdata = self.rfile.read(int(length))
		print("length: " + str(length) + " username: " + email)
		
		data = base64.b64decode(imgdata)
		with open(imgname, 'wb') as imgfile:
			imgfile.write(data)
		
		self.send_response(200)
		self.end_headers()

		print("End of POST request")
		
		_, cat_name, _, attributes_names = self._image_characteristics(imgname)
		print("The image category is: {}".format(cat_name))
		print("The image attributes are: {}".format(attributes_names))

		print("End of NN")
		
		update_wardrobe(email, imgdata, cat_name)
		
		print("Update Firebase")

		#_update_recommend_outfit(email)

	def _image_characteristics(self, img_path):
		"""Read the file and use the neural networks to predict the
		image characteristics.

		Assumes the training data is in the image-processing directory,
		with its default names.
		"""
		ip = ImageProcessor()
		category, category_name = ip.predict_category(img_path)
		attributes, attributes_names = ip.predict_attributes(img_path)
		return category, category_name, attributes, attributes_names
	
	def _update_recommend_outfit(self, user_email):

		reference = []
		root_cloth = create_nodes()
		
		wardrobe = get_wardrobe(user_email)

		wardrobe_outfits = []
		possible_outfit_from_wardrobe(wardrobe, wardrobe_outfits)

		recommend_outfits = recommend_outfits(root_cloth, wardrobe, reference)

		update_recommend_outfits(user_email, recommend_outfits)


if __name__ == '__main__':
	http_server = HTTPServer(('', PORT), ServerHTTP)
	http_server.serve_forever()
