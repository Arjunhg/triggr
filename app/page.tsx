import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <p className="font-cormorant">Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem, aut qui necessitatibus illo dolores quis quia odit beatae esse nemo iste corrupti minus, odio cupiditate sint, libero soluta eligendi tenetur!
      </p> 
      <UserButton/> {/*Only shown when user is logged in*/}
    </div>
  );
}
