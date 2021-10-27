import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";

export default interface IKcUser extends UserRepresentation {
    roles: Array<RoleRepresentation>
}
