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

        {/* Environment Check */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Environment Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Blob Storage:</span>
                <span className={process.env.BLOB_READ_WRITE_TOKEN ? "text-green-600" : "text-red-600"}>
                  {process.env.BLOB_READ_WRITE_TOKEN ? "✅ Configured" : "❌ Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Resend Email:</span>
                <span className={process.env.RESEND_API_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Replicate AI:</span>
                <span className={process.env.REPLICATE_API_TOKEN ? "text-green-600" : "text-red-600"}>
                  {process.env.REPLICATE_API_TOKEN ? "✅ Configured" : "❌ Not configured"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
