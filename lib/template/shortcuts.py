from config.config import Config
from __init__ import evaluate
from models.user import User
from models.group import Group
from models.repository import Repository

def evaluate_main(templatename, templatevariables={}, request=None):
	templatevariables['main_include'] = templatename

	config = Config()

	is_admin = False
	session_user = None
	if request and 'user' in request.session:
		try:
			session_user = request.session['user']
			is_admin = session_user.is_admin
		except User.DoesNotExist:
			pass

	users = []
	htpasswd_users = config.htpasswd.users()
	htpasswd_users.sort()
	if is_admin:
		for user in htpasswd_users:
			try:
				users.append(User(user))
			except User.DoesNotExist:
				pass
	else:
		users.append(session_user)

	groups = []
	authz_groups = config.authz.groups()
	authz_groups.sort()
	for groupname in authz_groups:
		group = Group(groupname)
		if is_admin or session_user.name in group.members:
			groups.append(group)

	repositories = []
	repository_names = []
	authz_repos = config.authz.paths()
	authz_repos.sort()
	for repos in authz_repos:
		if repos[0] and repos[0] not in repository_names:
			repository_names.append(repos[0])

	for repos in repository_names:
		repositories.append(Repository(repos))

	templatevariables['main_users'] = users
	templatevariables['main_groups'] = groups
	templatevariables['main_repositories'] = repositories

	templatevariables['main_media_url'] = config.get('www', 'media_url').rstrip('/')

	if request:
		templatevariables['request'] = request
		if 'user' in request.session:
			templatevariables['main_user'] = request.session['user']

	templatevariables['is_admin'] = is_admin

	return evaluate('../templates/main', templatevariables)
