import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Upload Schedule</h1>
        <p className="text-muted-foreground">
          Import your team schedules to begin optimizing your fleet.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Import .xlsx File</CardTitle>
          <CardDescription>
            Drag and drop your schedule file here or click to browse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg border-muted-foreground/50 text-center cursor-pointer hover:border-primary transition-colors">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">
              XLSX or CSV files supported
            </p>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300">Demo Note</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              For this demonstration, the application is using a pre-loaded <strong>schedule.csv</strong> file. The upload functionality is for display purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
