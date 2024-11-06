export interface Group {
    groupId: string;
    inviteCode: string;
    name: string;
    photoUrl: string;
    members: string[];
    admins: string[];
    createdBy: string;
}