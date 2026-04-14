import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Construct the payload for Diksha based on their API requirements
    const dikshaPayload = {
      request: {
        filters: {
          se_boards: body.board || ["ncert"],
          se_subjects: body.subject && body.subject !== "all" ? [body.subject] : [],
          primaryCategory: ["digital textbook", "e-textbook", "learning resource", "explanation content", "tv lesson", "TV Lesson", "course assessment"],
          se_mediums: body.medium ? [body.medium] : ["english"],
          se_gradeLevels: body.gradeLevel ? [body.gradeLevel] : [],
          visibility: ["Default", "Parent"]
        },
        limit: body.limit || 20,
        offset: body.offset || 0,
        query: body.query || "",
        sort_by: {
          lastPublishedOn: "desc"
        },
        fields: [
          "name", "appIcon", "mimeType", "gradeLevel", "identifier", 
          "medium", "pkgVersion", "board", "subject", "resourceType", 
          "primaryCategory", "contentType", "channel", "organisation", 
          "trackable", "se_mediums", "se_gradeLevels", "se_subjects", 
          "se_boards", "artifactUrl", "posterImage", "thumbnail"
        ],
        facets: [
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
          "primaryCategory"
        ]
      }
    };

    const response = await fetch('https://diksha.gov.in/api/content/v1/search?orgdetails=orgName,email&licenseDetails=name,description,url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Spoofing headers to look like a legitimate request from their own frontend if needed
        'Origin': 'https://diksha.gov.in',
        'Referer': 'https://diksha.gov.in/'
      },
      body: JSON.stringify(dikshaPayload)
    });

    if (!response.ok) {
      throw new Error(`Diksha API responded with ${response.status}`);
    }

    const data = await response.json();

    // Sort results to prioritize videos
    if (data.result && data.result.content) {
      data.result.content.sort((a: any, b: any) => {
        const isVideoA = 
          a.mimeType?.toLowerCase().includes('video') || 
          a.mimeType?.toLowerCase().includes('mp4') ||
          a.mimeType?.toLowerCase().includes('webm') ||
          a.primaryCategory?.toLowerCase().includes('tv lesson');
          
        const isVideoB = 
          b.mimeType?.toLowerCase().includes('video') || 
          b.mimeType?.toLowerCase().includes('mp4') ||
          b.mimeType?.toLowerCase().includes('webm') ||
          b.primaryCategory?.toLowerCase().includes('tv lesson');
        
        if (isVideoA && !isVideoB) return -1;
        if (!isVideoA && isVideoB) return 1;
        return 0;
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Diksha Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Diksha' }, { status: 500 });
  }
}
