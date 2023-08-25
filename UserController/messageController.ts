import { Request, Response } from "express"
import { pool } from "../db"

export const sendOrCreateMessageConnection = async (req:Request, res:Response) => {
    try {
       
        const { owner, notowner, sender, text, time } = req.body
        const notOnwerBlocked = await pool.query("SELECT blocked from user_info WHERE username = $1", [notowner])
        const checkIfBlocked = notOnwerBlocked.rows[0].blocked.filter((details: { username: string }) => details.username === owner)
        if (checkIfBlocked.length === 0) {
               const searchForBothUsersQuery = "SELECT * FROM texty_p_chat WHERE owner = $1 AND notowner = $2"
        const searchForOwnerMessageBox = await pool.query(searchForBothUsersQuery, [owner, notowner])
        const searchForNotOwnerMessageBox = await pool.query(searchForBothUsersQuery, [notowner, owner])
        
        const addToExistingQuery = "UPDATE texty_p_chat SET message = message || $1 WHERE owner = $2"
        const createNewMessageQuery = "INSERT INTO texty_p_chat(owner, notowner,notowner_imgurl, message) VALUES($1,$2,$3,$4)"

        const addMessageFunction = async (user1:string, user2:string, addUser:string,  checked1:boolean, checked2:boolean ) => {
         
             const addMessage = await  pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: checked1, time: time }), addUser])
             const createMessageBox = await pool.query(createNewMessageQuery, [user1, user2,"",  JSON.stringify([{ sender: sender, text: text, checked: checked2, time: time }])])   
        }

        if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length === 0) {
            const createOwnerMessageBox = await pool.query(createNewMessageQuery, [owner, notowner,"", JSON.stringify([{ sender: sender, text: text, checked: true, time: time }])]) 
            const createNotOwnerMessageBox = await pool.query(createNewMessageQuery, [notowner, owner,"", JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])])   
        } else if (searchForOwnerMessageBox.rows.length > 0 && searchForNotOwnerMessageBox.rows.length === 0) {

           addMessageFunction(notowner, owner, owner, true, false)

        } else if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length > 0) {

            addMessageFunction(owner, notowner, notowner,false, true )
            
        } else if (searchForOwnerMessageBox.rows.length > 0  && searchForNotOwnerMessageBox.rows.length > 0  ) {
            const addMessageOwner = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), owner])
            const addMessageNotForOwner = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: false, time: time }), notowner])
        }
         
        } 

        

    } catch (error:any) {
      res.status(404).send({message:"an error occured", state:false})
    }

}



export const updatechecked = async (req: Request, res: Response) => {
    try {
         const {owner,notowner} = req.body
        const getUserCurrentMeessage = await pool.query("SELECT * FROM texty_p_chat WHERE owner = $1 AND notowner = $2", [owner, notowner])
        const change = await getUserCurrentMeessage.rows[0].message.map((data: { checked: boolean }) => {
            data.checked = true
        })
    
    const updatechecked = await pool.query("UPDATE texty_p_chat SET message = $1 where owner = $2 AND notowner = $3", [JSON.stringify(getUserCurrentMeessage.rows[0].message), owner, notowner])
     } catch (error:any) {
        res.status(404).send({ message: "an error occured", state: false });
        
     }
}

export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { owner, notOwner } = req.body
     const messageBox = await pool.query("DELETE FROM texty_p_chat WHERE owner = $1 AND notowner = $2", [owner,notOwner])
        
    } catch (error: any) {
           res.status(404).send({ message: "an error occured", state: false });
    }
    
}
