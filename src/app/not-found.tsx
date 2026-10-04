import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="p-8 sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-7" aria-hidden="true" />
          </span>

          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page has moved out</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            The listing, booking or page you were looking for does not exist, was archived, or has been
            removed by its owner.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/properties">
                <Search />
                Browse rooms
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home />
                Back to home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
