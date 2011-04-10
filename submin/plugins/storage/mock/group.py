mock_groups = {} # {"mock": {'id': 0, 'name': 'mock', 'members': []}}

from submin.models.exceptions import GroupExistsError
ids = 0

def clear_groups():
	mock_groups.clear()

def list():
	"""Generator for sorted list of groups"""
	return mock_groups.values()

def add(groupname):
	global ids
	ids += 1
	if mock_groups.has_key(groupname):
		raise GroupExistsError

	mock_groups[groupname] = {'id': ids, 'name': groupname, 'members': []}

def group_data(groupname):
	if not mock_groups.has_key(groupname):
		return None
	return mock_groups[groupname]

def remove_permissions(groupid):
	pass

def remove_managers(groupid):
	pass

def remove_members_from_group(groupid):
	pass

def get_group_by_id(groupid):
	for key, value in mock_groups.iteritems():
		if value["id"] == groupid:
			return value

def remove(groupid):
	group = get_group_by_id(groupid)
	del mock_groups[group["name"]]

def members(groupid):
	from user import id2name

	return [id2name(x) for x in get_group_by_id(groupid)['members']]

def add_member(groupid, userid):
	get_group_by_id(groupid)['members'].append(userid)

def remove_member(groupid, userid):
	members = get_group_by_id(groupid)['members']
	for i in range(len(members)):
		if members[i] == userid:
			del members[i]
			break