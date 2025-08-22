import { Card, Button, Input, Textarea, Select, Checkbox, Badge, Alert, Divider, LoadingSpinner } from '../components/ui/Kit';

export default function UIPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          UI Kit Showcase
        </h1>
        <p className="text-xl text-gray-600">
          Beautiful orange and yellow themed components for BudgetTripPlanner
        </p>
      </div>

      {/* Buttons */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button className="group">
              With Icon
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Elements */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Elements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Input</label>
              <Input placeholder="Enter your text here..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Dropdown</label>
              <Select>
                <option>Choose an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Textarea</label>
              <Textarea placeholder="Enter your message here..." rows={4} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Checkboxes</label>
              <div className="space-y-2">
                <Checkbox label="Accept terms and conditions" />
                <Checkbox label="Subscribe to newsletter" />
                <Checkbox label="Enable notifications" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Radio Buttons</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="radio" className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                  <span className="text-sm text-gray-700">Option 1</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="radio" className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500" />
                  <span className="text-sm text-gray-700">Option 2</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="info">
            <strong>Info:</strong> This is an informational message for the user.
          </Alert>
          <Alert variant="success">
            <strong>Success:</strong> Your action was completed successfully!
          </Alert>
          <Alert variant="warning">
            <strong>Warning:</strong> Please review your input before proceeding.
          </Alert>
          <Alert variant="danger">
            <strong>Error:</strong> Something went wrong. Please try again.
          </Alert>
        </div>
      </Card>

      {/* Loading States */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading States</h2>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <LoadingSpinner size="sm" className="mb-2" />
            <p className="text-sm text-gray-600">Small</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" className="mb-2" />
            <p className="text-sm text-gray-600">Medium</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-2" />
            <p className="text-sm text-gray-600">Large</p>
          </div>
          <div className="text-center">
            <Button disabled>
              <LoadingSpinner size="sm" className="mr-2" />
              Loading...
            </Button>
          </div>
        </div>
      </Card>

      {/* Color Palette */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Primary 500</p>
            <p className="text-xs text-gray-500">#f97316</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Primary 600</p>
            <p className="text-xs text-gray-500">#ea580c</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Secondary 500</p>
            <p className="text-xs text-gray-500">#eab308</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-600 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Secondary 600</p>
            <p className="text-xs text-gray-500">#ca8a04</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Accent 500</p>
            <p className="text-xs text-gray-500">#f59e0b</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-sunset rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Sunset Gradient</p>
            <p className="text-xs text-gray-500">Orange to Yellow</p>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Heading 1 - Large Title</h1>
            <p className="text-sm text-gray-500">Font: Inter, 36px, Bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Heading 2 - Section Title</h2>
            <p className="text-sm text-gray-500">Font: Inter, 30px, Bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Heading 3 - Subsection</h3>
            <p className="text-sm text-gray-500">Font: Inter, 24px, Semibold</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900">Heading 4 - Card Title</h4>
            <p className="text-sm text-gray-500">Font: Inter, 20px, Semibold</p>
          </div>
          <div>
            <p className="text-lg text-gray-900">Body Large - Important text content</p>
            <p className="text-sm text-gray-500">Font: Inter, 18px, Regular</p>
          </div>
          <div>
            <p className="text-base text-gray-900">Body - Regular paragraph text</p>
            <p className="text-sm text-gray-500">Font: Inter, 16px, Regular</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Small - Secondary information</p>
            <p className="text-sm text-gray-500">Font: Inter, 14px, Regular</p>
          </div>
        </div>
      </Card>

      {/* Interactive Elements */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Elements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hover Effects</h3>
            <div className="space-y-2">
              <Button className="group">
                Hover me
                <svg className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <Card className="p-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                Hoverable Card
              </Card>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Focus States</h3>
            <div className="space-y-2">
              <Input placeholder="Focus me..." />
              <Button variant="outline">Focus me</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Spacing & Layout */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Spacing & Layout</h2>
        <div className="space-y-4">
          <div className="bg-orange-100 p-4 rounded-lg">
            <p className="text-orange-800">This is a spacing example with padding and margin</p>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <p className="text-yellow-800">Grid Item 1</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <p className="text-orange-800">Grid Item 2</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <p className="text-yellow-800">Grid Item 3</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


