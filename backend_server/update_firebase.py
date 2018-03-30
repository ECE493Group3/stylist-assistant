import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

def get_uid(user_email):
	ref = db.reference('/users/').get()

	for uid in ref:
		em = db.reference('/users/'+ uid).child('email').get()
		if em == user_email:
			return uid

def connect_firebase():
	# Fetch the service account key JSON file contents
	cred = credentials.Certificate('personalstylist-b4f6e0477b67.json')

	firebase_admin.initialize_app(cred, {
		'databaseURL': 'https://personalstylist-788fb.firebaseio.com'
		})

if __name__ == '__main__':
	connect_firebase()

	c = get_uid("asfd@fads.com")
	print c

	c = get_uid('aaaregister@test.com')
	print c