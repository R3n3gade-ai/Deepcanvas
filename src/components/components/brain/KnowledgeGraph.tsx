import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import brainService, { BrainDocument, BrainCollection } from "../../utils/brainService";

interface KnowledgeGraphProps {
  userId: string;
  documents: BrainDocument[];
  collections: BrainCollection[];
}

export function KnowledgeGraph({ userId, documents, collections }: KnowledgeGraphProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [graphType, setGraphType] = useState<"network" | "timeline" | "heatmap">("network");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  
  // Filter documents based on selected collection
  const filteredDocuments = selectedCollection === "all" 
    ? documents 
    : documents.filter(doc => {
        const collection = collections.find(c => c.id === selectedCollection);
        return collection && collection.documents.includes(doc.id);
      });
  
  // Render the graph
  useEffect(() => {
    if (!graphRef.current || filteredDocuments.length === 0) return;
    
    setIsLoading(true);
    
    // Clear previous graph
    graphRef.current.innerHTML = "";
    
    // Render the appropriate graph type
    if (graphType === "network") {
      renderNetworkGraph(graphRef.current, filteredDocuments, collections);
    } else if (graphType === "timeline") {
      renderTimelineGraph(graphRef.current, filteredDocuments);
    } else if (graphType === "heatmap") {
      renderHeatmapGraph(graphRef.current, filteredDocuments);
    }
    
    setIsLoading(false);
  }, [graphType, filteredDocuments, collections, selectedCollection]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Knowledge Visualization</CardTitle>
            <CardDescription>
              Visualize your knowledge base to discover insights and connections
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={graphType} onValueChange={(value) => setGraphType(value as any)}>
              <TabsList>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[400px] text-center">
            <p className="text-gray-500 mb-4">No documents to visualize</p>
            <Button>Add Knowledge</Button>
          </div>
        ) : (
          <div 
            ref={graphRef} 
            className="w-full h-[400px] border rounded-md bg-gray-50"
          ></div>
        )}
      </CardContent>
    </Card>
  );
}

// Render a network graph of documents
function renderNetworkGraph(container: HTMLDivElement, documents: BrainDocument[], collections: BrainCollection[]) {
  // In a real implementation, you would use a library like D3.js or vis.js
  // For now, we'll just render a placeholder
  
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw nodes and edges
  const nodes: {id: string, x: number, y: number, radius: number, color: string, label: string}[] = [];
  
  // Create nodes for documents
  documents.forEach((doc, index) => {
    const angle = (index / documents.length) * Math.PI * 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    const x = canvas.width / 2 + Math.cos(angle) * radius;
    const y = canvas.height / 2 + Math.sin(angle) * radius;
    
    // Determine node color based on content type
    let color = "#6366f1"; // Default indigo
    if (doc.contentType === "image") color = "#8b5cf6"; // Purple
    if (doc.contentType === "pdf") color = "#ef4444"; // Red
    if (doc.contentType === "video") color = "#f97316"; // Orange
    if (doc.contentType === "audio") color = "#10b981"; // Green
    if (doc.contentType === "url") color = "#0ea5e9"; // Sky blue
    
    nodes.push({
      id: doc.id,
      x,
      y,
      radius: 8,
      color,
      label: doc.title
    });
  });
  
  // Draw edges between related documents
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // Draw an edge if documents are in the same collection
      const inSameCollection = collections.some(collection => 
        collection.documents.includes(nodes[i].id) && 
        collection.documents.includes(nodes[j].id)
      );
      
      if (inSameCollection) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes
  nodes.forEach(node => {
    // Draw node
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      node.label.length > 20 ? node.label.substring(0, 20) + "..." : node.label, 
      node.x, 
      node.y + node.radius + 15
    );
  });
  
  // Add legend
  const legendItems = [
    { label: "Text", color: "#6366f1" },
    { label: "Image", color: "#8b5cf6" },
    { label: "PDF", color: "#ef4444" },
    { label: "Video", color: "#f97316" },
    { label: "Audio", color: "#10b981" },
    { label: "URL", color: "#0ea5e9" }
  ];
  
  const legendX = 20;
  let legendY = 20;
  
  legendItems.forEach(item => {
    // Draw color box
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY, 15, 15);
    
    // Draw label
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.label, legendX + 20, legendY + 12);
    
    legendY += 25;
  });
}

// Render a timeline graph of documents
function renderTimelineGraph(container: HTMLDivElement, documents: BrainDocument[]) {
  // In a real implementation, you would use a library like D3.js or vis-timeline
  // For now, we'll just render a placeholder
  
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Sort documents by date
  const sortedDocs = [...documents].sort((a, b) => 
    new Date(a.metadata.dateAdded).getTime() - new Date(b.metadata.dateAdded).getTime()
  );
  
  if (sortedDocs.length === 0) return;
  
  // Find date range
  const firstDate = new Date(sortedDocs[0].metadata.dateAdded).getTime();
  const lastDate = new Date(sortedDocs[sortedDocs.length - 1].metadata.dateAdded).getTime();
  const dateRange = lastDate - firstDate;
  
  // Draw timeline axis
  const margin = 50;
  const timelineY = canvas.height - margin;
  
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, timelineY);
  ctx.lineTo(canvas.width - margin, timelineY);
  ctx.stroke();
  
  // Draw ticks and labels
  const numTicks = 5;
  const tickLength = 10;
  
  for (let i = 0; i < numTicks; i++) {
    const x = margin + (canvas.width - 2 * margin) * (i / (numTicks - 1));
    
    // Draw tick
    ctx.beginPath();
    ctx.moveTo(x, timelineY);
    ctx.lineTo(x, timelineY + tickLength);
    ctx.stroke();
    
    // Draw label
    const date = new Date(firstDate + (dateRange * (i / (numTicks - 1))));
    ctx.fillStyle = "#4b5563";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(date.toLocaleDateString(), x, timelineY + tickLength + 15);
  }
  
  // Draw document points
  sortedDocs.forEach(doc => {
    const date = new Date(doc.metadata.dateAdded).getTime();
    const x = margin + ((date - firstDate) / dateRange) * (canvas.width - 2 * margin);
    const y = timelineY - 20;
    
    // Determine point color based on content type
    let color = "#6366f1"; // Default indigo
    if (doc.contentType === "image") color = "#8b5cf6"; // Purple
    if (doc.contentType === "pdf") color = "#ef4444"; // Red
    if (doc.contentType === "video") color = "#f97316"; // Orange
    if (doc.contentType === "audio") color = "#10b981"; // Green
    if (doc.contentType === "url") color = "#0ea5e9"; // Sky blue
    
    // Draw point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      doc.title.length > 15 ? doc.title.substring(0, 15) + "..." : doc.title, 
      x, 
      y - 10
    );
  });
}

// Render a heatmap graph of document activity
function renderHeatmapGraph(container: HTMLDivElement, documents: BrainDocument[]) {
  // In a real implementation, you would use a library like D3.js or heatmap.js
  // For now, we'll just render a placeholder
  
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Group documents by month
  const monthCounts: Record<string, number> = {};
  const contentTypeCounts: Record<string, number> = {};
  
  documents.forEach(doc => {
    const date = new Date(doc.metadata.dateAdded);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    // Count by month
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    
    // Count by content type
    contentTypeCounts[doc.contentType] = (contentTypeCounts[doc.contentType] || 0) + 1;
  });
  
  // Draw month heatmap
  const months = Object.keys(monthCounts).sort();
  const maxCount = Math.max(...Object.values(monthCounts));
  
  const cellWidth = Math.min(50, (canvas.width - 100) / months.length);
  const cellHeight = 40;
  const startX = 50;
  const startY = 50;
  
  // Draw month cells
  months.forEach((month, index) => {
    const count = monthCounts[month];
    const intensity = count / maxCount;
    
    // Calculate color (blue with varying opacity)
    const r = Math.round(99 * (1 - intensity) + 37 * intensity);
    const g = Math.round(102 * (1 - intensity) + 99 * intensity);
    const b = Math.round(241 * (1 - intensity) + 235 * intensity);
    
    const x = startX + index * cellWidth;
    
    // Draw cell
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, startY, cellWidth - 2, cellHeight);
    
    // Draw count
    ctx.fillStyle = intensity > 0.7 ? "#ffffff" : "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(count.toString(), x + cellWidth / 2, startY + cellHeight / 2 + 5);
    
    // Draw month label
    const [year, monthNum] = month.split('-');
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' });
    
    ctx.fillStyle = "#4b5563";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${monthName} ${year}`, x + cellWidth / 2, startY + cellHeight + 15);
  });
  
  // Draw content type distribution
  const contentTypes = Object.keys(contentTypeCounts);
  const barHeight = 30;
  const barSpacing = 10;
  const barStartY = startY + cellHeight + 50;
  const maxTypeCount = Math.max(...Object.values(contentTypeCounts));
  const barMaxWidth = canvas.width - 150;
  
  // Draw title
  ctx.fillStyle = "#1f2937";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Content Type Distribution", startX, barStartY - 20);
  
  // Draw bars
  contentTypes.forEach((type, index) => {
    const count = contentTypeCounts[type];
    const barWidth = (count / maxTypeCount) * barMaxWidth;
    const y = barStartY + index * (barHeight + barSpacing);
    
    // Determine bar color based on content type
    let color = "#6366f1"; // Default indigo
    if (type === "image") color = "#8b5cf6"; // Purple
    if (type === "pdf") color = "#ef4444"; // Red
    if (type === "video") color = "#f97316"; // Orange
    if (type === "audio") color = "#10b981"; // Green
    if (type === "url") color = "#0ea5e9"; // Sky blue
    
    // Draw bar
    ctx.fillStyle = color;
    ctx.fillRect(startX, y, barWidth, barHeight);
    
    // Draw label
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), startX + barWidth + 10, y + barHeight / 2 + 5);
    
    // Draw count
    ctx.fillStyle = "#4b5563";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(count.toString(), startX - 10, y + barHeight / 2 + 5);
  });
}
