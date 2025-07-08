
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from '../../server/db';
import { redirect } from "next/navigation";

const SyncUser = async () => {
    const { userId } = await auth()
    if(!userId){
        throw new Error("User not authenticated")
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if(!user.emailAddresses[0]?.emailAddress){
        throw new Error("User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await db.user.upsert({
        where: { 
            emailAddress: user.emailAddresses[0]?.emailAddress,
        },
        update: {
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
        },
        create: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
            credit: 150,
        }
    })
    return redirect("/dashboard");
}   

export default SyncUser
