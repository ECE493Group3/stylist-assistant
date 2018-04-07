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

def get_reference(user_email):
	user_id = str(get_uid(user_email))

	try:
		ref = db.rference('/users/'+user_id+'/recommendeditems').get()
	except:
	#	connect_firebase()
		ref = db.reference('/users/'+user_id+'/recommendeditems').get()
	
	reference = []
	for items in ref:
		#print(str(items))
		
		full_body = db.reference('/users/'+user_id+'/recommendeditems/'+ str(items)).child('categoryfull').get()
		if(full_body != 'None'):
			c = Cloth("", "", full_body)
			outfit = Outfit(c)
			reference.append(outfit)

		elif(full_body == 'None'):
			top = db.reference('/users/'+user_id+'/recommendeditems/'+items).child('categorytop').get()
			top_c = Cloth("", "", top)
			
			bottom = db.reference('/users/'+user_id+'/recommendeditems/'+items).child('categorybottom').get()
			bottom_c = Cloth("","", bottom)
			outfit = Outfit(top_c, bottom_c, COMBINATIONS)
			reference.append(outfit)
	
	return reference

def get_wardrobe(user_email):
	user_id = str(get_uid(user_email))
	try:
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/wardrobeitems').get()

	#user_id = get_uid(user_email)
	wardrobe = []
	for items in ref:
		img_file = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('img').get()
		cat = db.reference('/users/'+user_id+'/wardrobeitems/'+items).child('category').get()
		c = Cloth(img_file, "", cat, img_id = str(items))
		wardrobe.append(c)

	return wardrobe

def update_wardrobe(user_email, imageURL, category):
	user_id = str(get_uid(user_email))
	try:
		ref = db.reference('/users/'+user_id+'/wardrobeitems')
	except:
		connect_firebase()
		ref = db.reference('/users/'+user_id+'/wardrobeitems')

	wardrobeitems = {
		"category": str(category),
		"img": "data:image/jpg;base64," + str(imageURL),
	}

	ref.push(wardrobeitems)
	
def update_recommended_items(user_email, recommend_outfits):
	user_id = str(get_uid(user_email))

	ref = db.reference('/users/'+user_id+'/recommendeditems')

	outfit = {
		"categorybottom":"Jeans",
		"categoryfull":"None",
		"categorytop":"Hoodie",
		"img":"None",
		}
	ref.push(outfit)

def update_recommended_outfits(user_email, recommend_outfits):
	
	user_id = str(get_uid(user_email))
	ref = db.reference('/users/'+user_id+'/recommendedoutfits')
	try:
		for i in ref.get():
			db.reference('/users/'+user_id+'/recommendedoutfits/'+str(i)).delete()
	except:
		print("Recommended outfits already empty")
	#return
	#user_id = get_uid(user_email)
	for r_out in recommend_outfits:
		outfit = r_out['outfit']
		if (outfit.get_type() == FULLBODY):
			category = str(outfit.get_full_body().get_cat_label())
			outfit = {
				"categorybottom":"None",
				"categoryfull": category,
				"categorytop":"None",
				"imgtop":"None",
				"imgbottom":"None",
				"imgfull":outfit.get_full_body().get_img_file(),
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
				"imgtop":outfit.get_top().get_img_file(),
				"imgbottom":outfit.get_bottom().get_img_file(),
				"imgfull":"None",
				"name": top_category + " and " + bot_category,
			}
			ref.push(outfit) 
		else:
			return
		
		#print(str(outfit))
def connect_firebase():
	# Fetch the service account key JSON file contents
	cred = credentials.Certificate(filename)

	firebase_admin.initialize_app(cred, {
		'databaseURL': 'https://personalstylist-788fb.firebaseio.com'
		})

if __name__ == '__main__':

	c = "askalburgi@gmail.com"
#	wardrobe = get_reference("askalburgi@gmail.com")
#	update_recommended_items(c, "")
#	update_wardrobe(c, "", "")
#	for i in wardrobe:
#		print(str(i))

	update_recommended_outfits(c, [])
		
	print c

	exit(1)
