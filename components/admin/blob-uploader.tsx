"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, AlertCircle, Copy, ExternalLink, Loader2, FileImage, Info } from "lucide-react"

export function BlobUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("restoration-demo.gif")
  const [copySuccess, setCopySuccess] = useState(false)

  const uploadToBlob = async () => {
    setIsUploading(true)
    setError(null)
    setUploadResult(null)

    try {
      console.log("Starting upload for:", fileName)

      const response = await fetch("/api/upload-to-blob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      })

      const result = await response.json()
      console.log("Upload result:", result)

      if (result.success) {
        setUploadResult(result)
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const copyUrl = async () => {
    if (uploadResult?.blobUrl) {
      try {
        await navigator.clipboard.writeText(uploadResult.blobUrl)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload GIF to Blob Storage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-1">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Make sure your GIF file is in the <code className="bg-blue-100 px-1 rounded">public/</code> folder
                    </li>
                    <li>Enter the exact filename below</li>
                    <li>Click upload to move it to Blob storage</li>
                    <li>Copy the Blob URL to use in your components</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <label className="block text-sm font-medium mb-2">File Name (in public folder)</label>
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-gray-400" />
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="restoration-demo.gif"
                className="font-mono"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              File path: <code className="bg-gray-100 px-1 rounded">public/{fileName}</code>
            </p>
          </div>

          <Button onClick={uploadToBlob} disabled={isUploading || !fileName} className="w-full" size="lg">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading to Blob...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Blob Storage
              </>
            )}
          </Button>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700 font-medium">Upload Failed</p>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>

                {error.includes("not found") && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-red-700 text-sm">
                    <p className="font-medium">Common fixes:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        Check the file exists in <code>public/{fileName}</code>
                      </li>
                      <li>Verify the filename spelling and extension</li>
                      <li>Make sure the file isn't in a subfolder</li>
                    </ul>
                  </div>
                )}

                {error.includes("not configured") && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-red-700 text-sm">
                    <p className="font-medium">Blob storage not configured:</p>
                    <p>
                      Add <code>BLOB_READ_WRITE_TOKEN</code> to your .env.local file
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {uploadResult && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 font-medium">Upload Successful! 🎉</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Blob URL:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-gray-100 p-3 rounded text-xs break-all font-mono">
                        {uploadResult.blobUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyUrl}
                        className={copySuccess ? "bg-green-100 border-green-300" : ""}
                      >
                        {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(uploadResult.blobUrl, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    {copySuccess && <p className="text-green-600 text-xs mt-1">✅ Copied to clipboard!</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Size: {uploadResult.sizeFormatted}</Badge>
                    <Badge variant="secondary">File: {uploadResult.originalPath}</Badge>
                    <Badge className="bg-green-100 text-green-700">Blob Storage</Badge>
                  </div>

                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-blue-800 font-medium text-sm mb-2">🚀 Next Steps:</p>
                      <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                        <li>Copy the Blob URL above (click the copy button)</li>
                        <li>
                          Update your <code className="bg-blue-100 px-1 rounded">video-demo.tsx</code> component
                        </li>
                        <li>Replace the local GIF path with this Blob URL</li>
                        <li>Test that the GIF loads properly</li>
                        <li>Deploy your changes to production</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border border-yellow-200">
                    <CardContent className="p-4">
                      <p className="text-yellow-800 font-medium text-sm mb-2">📝 Code Update:</p>
                      <p className="text-yellow-700 text-sm mb-2">Replace this line in your video-demo component:</p>
                      <code className="block bg-yellow-100 p-2 rounded text-xs font-mono text-yellow-800">
                        const BLOB_GIF_URL = "{uploadResult.blobUrl}"
                      </code>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* File Browser Helper */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Common Files in Public Folder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono">restoration-demo.gif</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFileName("restoration-demo.gif")}
                disabled={fileName === "restoration-demo.gif"}
              >
                Use This
              </Button>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono">restoration-demo.mp4</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFileName("restoration-demo.mp4")}
                disabled={fileName === "restoration-demo.mp4"}
              >
                Use This
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Click "Use This" to quickly select common demo files</p>
        </CardContent>
      </Card>
    </div>
  )
}
