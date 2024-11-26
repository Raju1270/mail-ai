import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <div className="">
      <div className="space-x-4">
                    <Button>
                        <Link href="/mail">Get Started</Link>
                    </Button>
                    <UserButton />
                    </div>
                    </div>
    </>
  );
}
