import { BlobUploader } from "@/components/admin/blob-uploader"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-gray-600">Upload your GIF to Blob storage for reliable delivery</p>
        </div>

        <BlobUploader />
      </div>
    </div>
  )
}
