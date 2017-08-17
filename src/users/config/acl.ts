import * as node_acl from 'acl';

const acl = new node_acl(new node_acl.memoryBackend());

acl.addRoleParents('user', 'guest');
acl.addRoleParents('admin', 'user');

export default acl;
