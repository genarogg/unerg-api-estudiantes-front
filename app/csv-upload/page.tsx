import { FileUploader } from "@/components/file-uploader"

export default function CSVUploadPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Archivos</h1>
      <FileUploader />
    </main>
  )
}

