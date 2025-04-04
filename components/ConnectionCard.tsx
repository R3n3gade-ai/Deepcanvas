import React from 'react';
import { ApiConnection } from '../utils/apiConnectionsStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ConnectionCardProps {
  connection: ApiConnection;
  onTest: (id: string) => void;
  onEdit: (connection: ApiConnection) => void;
  onDelete: (id: string) => void;
  isTesting: boolean;
}

export function ConnectionCard({ connection, onTest, onEdit, onDelete, isTesting }: ConnectionCardProps) {
  // Format the last tested time
  const lastTestedText = connection.last_tested 
    ? `Last tested ${formatDistanceToNow(new Date(connection.last_tested), { addSuffix: true })}` 
    : 'Never tested';

  return (
    <Card className="w-full overflow-hidden shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{connection.name}</CardTitle>
            <CardDescription className="text-sm">
              {connection.service.charAt(0).toUpperCase() + connection.service.slice(1).replace('_', ' ')}
            </CardDescription>
          </div>
          <StatusBadge status={connection.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {connection.description && (
          <p className="text-sm text-gray-600 mb-2">{connection.description}</p>
        )}
        <p className="text-xs text-gray-500">{lastTestedText}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(connection)}
          >
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(connection.id)}
          >
            Delete
          </Button>
        </div>
        <Button 
          variant={connection.status === 'connected' ? "outline" : "default"}
          size="sm"
          onClick={() => onTest(connection.id)}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-r-transparent animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: 'outline' | 'default' | 'secondary' | 'destructive' = 'outline';
  let text = 'Untested';
  
  switch (status) {
    case 'connected':
      variant = 'default'; // Green
      text = 'Connected';
      break;
    case 'failed':
      variant = 'destructive'; // Red
      text = 'Failed';
      break;
    case 'untested':
    default:
      variant = 'secondary'; // Gray
      text = 'Untested';
      break;
  }
  
  return <Badge variant={variant}>{text}</Badge>;
}
