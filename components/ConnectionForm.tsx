import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NewApiConnection, ApiConnection, ApiConnectionUpdate } from '../utils/apiConnectionsStore';

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  service: z.string().min(1, { message: 'Please select a service' }),
  description: z.string().optional(),
  api_key: z.string().min(1, { message: 'API key is required' }),
});

// Available service options
const serviceOptions = [
  { value: 'vertex_ai', label: 'Vertex AI' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'huggingface', label: 'Hugging Face' },
  { value: 'other', label: 'Other' },
];

interface ConnectionFormProps {
  initialValues?: ApiConnection;
  isEdit?: boolean;
  onSubmit: (data: NewApiConnection | ApiConnectionUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ConnectionForm({ 
  initialValues, 
  isEdit = false, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ConnectionFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({  
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues?.name || '',
      service: initialValues?.service || '',
      description: initialValues?.description || '',
      api_key: '', // We don't pre-fill API keys for security reasons
    },
  });

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Connection' : 'Add New Connection'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My API Connection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Service field */}
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit} // Can't change service once created
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of what this API connection is used for" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* API Key field */}
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key {isEdit && '(Leave blank to keep existing)'}</FormLabel>
                  <div className="flex relative">
                    <FormControl>
                      <Input 
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your API key" 
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-r-transparent animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Connection' : 'Create Connection'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
