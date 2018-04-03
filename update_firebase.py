import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

from cloth import Cloth

def get_uid(user_email):
	try:
		ref = db.reference('/users/').get()
	except:
		connect_firebase()
		ref = db.reference('/users/').get()

	for uid in ref:
		em = db.reference('/users/'+ uid).child('email').get()
		if em == user_email:
			return uid

def get_wardrobe(user_id):

	try:
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()

	wardrobe = []
	for items in ref:
		img_file = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('img').get()
		cat = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('category').get()
		c = Cloth(img_file, "", cat)
		wardrobe.append(c)

	return wardrobe

def update_recommended_outfits(user_id, recommend_outfits):

	try:
		ref = db.reference('/users/'+user_id+'/recommendedoutfits')
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/recommendedoutfits')
	
	outfits = {
		"categorybottom": "Jeans",
		"categoryfull": "None",
		"categorytop": "Hoodie",
		"imgage": "img/ionic.png",
		"name": "Other Jeans and Hoodie",
	}	

	ref.push(outfits)

def connect_firebase():
	# Fetch the service account key JSON file contents
	cred = credentials.Certificate('personalstylist-b4f6e0477b67.json')

	firebase_admin.initialize_app(cred, {
		'databaseURL': 'https://personalstylist-788fb.firebaseio.com'
		})

if __name__ == '__main__':
	# connect_firebase()

	c = get_uid("askalburgi@gmail.com")
	wardrobe = get_wardrobe(c)

	for i in wardrobe:
		print(str(i))

	update_recommended_outfits(c, [])

	print c

	exit(1)
	c = get_uid('aaaregister@test.com')
	print c