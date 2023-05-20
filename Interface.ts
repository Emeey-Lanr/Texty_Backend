
export interface FollowFollowersDetails  {
    username?: string;
    img_url?: string ;
    about_me?: string;
}
export interface Notification {
    followed: boolean;
    checked: boolean;
    notificationDetails: string;
    username: string;
    img_url:string,

}
export interface COMMENT {
    name: string,
    text: string,
    time: string,
    date:string,
}
// interface LIKES {
    
// }
export interface POST {
     text?: string,
     date?:string,
    time?:string,
    postedBy?:string,
    img_url?: string,
    comment?: COMMENT[],
    Likes?:string[],
 }
export interface ServerDatabase {
    id:string,
    username: string;
    img_url: string;
    about_me: string;
    post: POST[];
    following: FollowFollowersDetails[];
    followers:FollowFollowersDetails [];
    notification:Notification [];
    state:string
}


 export interface MessageInterface {
    time?: string;
     text?: string;
     checked?: boolean;
    sender?: string;
}
export interface ServerMessageInterface {
    owner:string;
    notowner: string;
    notowner_imgurl: string;
    message:MessageInterface[];
}