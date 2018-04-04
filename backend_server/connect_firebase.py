import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from keys import filename

from cloth import *

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

def get_wardrobe(user_email):

	try:
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()

	user_id = get_uid(user_email)
	wardrobe = []
	for items in ref:
		img_file = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('img').get()
		cat = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('category').get()
		c = Cloth(img_file, "", cat)
		wardrobe.append(c)

	return wardrobe

def update_wardrobe(user_email, imageURL, category):

	try:
		ref = db.reference('/users/'+user_id+'/wardrobeitems')
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/wardrobeitems')

	user_id = get_uid(user_email)
	wardrobeitems = {
		"category": str(cloth_item.get_cat_label()),
		"imageURL": str(imageURL),
	}

	ref.push(wardrobeitems)
	
def update_recommended_outfits(user_email, recommend_outfits):

	try:
		ref = db.reference('/users/'+user_id+'/recommendedoutfits')
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/recommendedoutfits')

	user_id = get_uid(user_email)
	for out in recommend_outfits:
		if (outfit.get_type() == FULLBODY):
			category = str(outfit.get_full_body().get_cat_label())
			outfit = {
				"categorybottom":"None",
				"categoryfull": category,
				"categorytop":"None",
				"img":"None",
				"name": category,
			}
			ref.push(outfit) 
		elif(outfit.get_type() == COMBINATIONS):

			top_category = str(outfit.get_top().get_cat_label())
			bot_category = str(outfit.get_bottom().get_cat_label())
			outfit = {
				"categorybottom":bot_category,
				"categoryfull": "None",
				"categorytop":top_category,
				"img":"None",
				"name": top_category + " and " + bot_category,
			}
			ref.push(outfit) 
		else:
			return

def connect_firebase():
	# Fetch the service account key JSON file contents
	cred = credentials.Certificate(filename)

	firebase_admin.initialize_app(cred, {
		'databaseURL': 'https://personalstylist-788fb.firebaseio.com'
		})

if __name__ == '__main__':

	c = get_uid("askalburgi@gmail.com")
	wardrobe = get_wardrobe(c)

	update_wardrobe(c, "", "")
	for i in wardrobe:
		print(str(i))

	update_recommended_outfits(c, [])
		
	print c

	exit(1)
