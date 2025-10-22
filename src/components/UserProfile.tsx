import { userData } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserProfile = () => {
  return (
    <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
      <Avatar className="h-10 w-10 border-2 border-primary">
        <AvatarImage src={userData.avatar} alt={userData.name} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {userData.name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:block text-left">
        <p className="text-sm font-semibold">{userData.name}</p>
        <p className="text-xs text-muted-foreground">{userData.email}</p>
      </div>
    </div>
  );
};
