import { NextRequest, NextResponse } from "next/server"
import Tesseract from "tesseract.js"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const fileType = file.type
    let extractedText = ""

    // Handle PDF files
    if (fileType === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Dynamic import for pdf-parse (CommonJS module)
      const pdfParse = (await import("pdf-parse")).default
      const data = await pdfParse(buffer)
      extractedText = data.text
    }
    // Handle image files
    else if (fileType.startsWith("image/")) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        logger: () => {} // Suppress logs
      })
      
      extractedText = text
    }
    else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or image file." },
        { status: 400 }
      )
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please try a different file or paste text manually." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error("File processing error:", error)
    return NextResponse.json(
      { error: "Failed to process file. Please try again or paste text manually." },
      { status: 500 }
    )
  }
}