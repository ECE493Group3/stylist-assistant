
import anytree
from anytree import Node, RenderTree, Walker

def create_nodes():

	# Root Node
	root_cloth = Node("Cloth")
	cloth_dict = {
		"Cloth": ["Tops", "Bottoms", "Fullbody"],
		"Tops": ["Sweater", "Jacket", "Tee"],
		"Bottoms": ["Pants", "Sweatpants", "Shorts", "Skirt"],
		"Fullbody": ["Coat", "Onesie", "Dress"],
		"Sweater":["Blazer", "Bomber", "Cardigan", "Hoodie", "Turtleneck", "Flannel"],
		"Jacket": ["Parka", "Peacoat", "Poncho", "Anorak"],
		"Tee": ["Top", "Blouse", "Jersey", "Button-Down", "Tank", "Henley", "Halter"],
		"Pants": ["Jeans", "Chinos", "Joggers"],
		"Sweatpants": ["Leggings", "Culottes", "Jodhpurs", "Capris", "Jeggings"],
		"Shorts": ["Cutoffs", "Trunks", "Sweatshorts"],
		"Skirt": ["Gauchos", "Sarong"],
		"Coat": ["Robe", "Cape"],
		"Onesie": ["Jumpsuit", "Romper"],
		"Dress": ["Coverup", "Caftan", "Kimono", "Kaftan", "Nightdress", "Shirtdress", "Sundress"],
	}

	insert_order = ["Cloth", "Tops", "Bottoms", "Fullbody", "Sweater", "Jacket", "Tee", "Pants", "Sweatpants", "Shorts", "Skirt", "Coat", "Onesie", "Dress"]

	for parent in insert_order:
		parent_node = anytree.find(root_cloth, lambda node: node.name == parent)

		for node in cloth_dict[parent]:
			x =Node(node, parent = parent_node)

	return root_cloth

if __name__ == '__main__':
	root = create_nodes()

	for pre, fill, node in RenderTree(root):
		print("%s%s" % (pre, node.name))	
