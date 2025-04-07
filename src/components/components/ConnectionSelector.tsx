import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import apiConnectService, { Connection } from "../utils/apiConnectService";
import { getProviderById } from "../utils/apiProviders";
import { useNavigate } from "react-router-dom";

interface ConnectionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  connectionType?: string;
  placeholder?: string;
  label?: string;
}

export function ConnectionSelector({
  value,
  onChange,
  connectionType,
  placeholder = "Select a connection",
  label = "Connection"
}: ConnectionSelectorProps) {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // Load user connections
  const loadConnections = () => {
    setIsLoading(true);
    try {
      const userConnections = apiConnectService.loadConnections('user-123'); // In a real app, this would be the actual user ID
      
      // Filter by connection type if specified
      const filteredConnections = connectionType
        ? userConnections.filter(conn => {
            const provider = getProviderById(conn.providerId);
            return provider?.id === connectionType;
          })
        : userConnections;
      
      setConnections(filteredConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to API Connect page
  const handleAddConnection = () => {
    navigate('/api-connect');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="flex-1">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent>
            {connections.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500">
                No connections available
              </div>
            ) : (
              connections.map(connection => {
                const provider = getProviderById(connection.providerId);
                return (
                  <SelectItem key={connection.id} value={connection.id}>
                    {provider ? provider.name : connection.name}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleAddConnection} title="Add new connection">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
