import anytree
from anytree import Node, RenderTree, Walker

def get_type_similarity(root, cloth1, cloth2):

	cloth1_cat = cloth1.get_cat_label()
	cloth1_node = anytree.find(root, lambda node: node.name == cloth1_cat)

	cloth2_cat = cloth2.get_cat_label()
	cloth2_node = anytree.find(root, lambda node: node.name == cloth2_cat)

	# Walk from start node to end node
	# Returns:
	# upward is a list of nodes to go upward to.
	# common is common up node
	# downward is a list of nodes to go downward to
	# print("Cloth1_cat" + str(cloth1_cat))
	# print("Cloth2_cat" + str(cloth2_cat))
	# print("Cloth1_node: " + str(cloth1_node))
	# print("Cloth2_node: " + str(cloth2_node))
	w = Walker()
	upward, common, downward = w.walk(cloth1_node, cloth2_node)

	if(cloth1_node.name == cloth2_node.name):
		# Exact Match
		return 1
	elif((cloth1_node.name == cloth2_node.parent.name) or (cloth1_node.parent.name == cloth2_node.name) or (cloth1_node.parent.name == cloth2_node.parent.name)):
		# Cloth 1 type is an ancestor of cloth_2 or vise versa
		return 0.5
	elif(common.name == "Cloth"):
		return 0
	elif(common.name == "Tops" or common.name =="Bottoms" or common.name == "Fullbody"):
		return 0.25
	else:
		print("What do I miss")
		return 0

def get_attribute_similarity(attr, cloth1, cloth2):
	if(attr in cloth1.values() and attr in cloth2.values()):
		return 1
	else:
		return 0

def get_item_similarity(root, cloth1, cloth2):
	cat_sim = get_type_similarity(root, cloth1, cloth2)

	attr_sim = 0
	set_c1 = set(cloth1.attr_label)
	set_c2 = set(cloth2.attr_label)
	set_c = set_c1 & set_c2

	for i in set_c:
		if(cloth1.attr_label[i] == cloth2.attr_label[i]):
			attr_sim += 1

	union_c = set_c1 | set_c2
	if(len(union_c) == 0):
		return 0.5 * cat_sim

	# return sum / (1 + len(union_c))
	return 0.5 * cat_sim + 0.5 * attr_sim / (len(union_c))
