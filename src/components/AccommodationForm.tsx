import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';

type AccommodationFormProps = {
  initialData?: {
    type: string;
    roomNumber: string;
    building: string;
    checkIn: string;
    checkOut: string;
  };
  onSubmit: (data: {
    type: string;
    roomNumber: string;
    building: string;
    checkIn: string;
    checkOut: string;
  }) => void;
  onCancel: () => void;
};

export default function AccommodationForm({ initialData, onSubmit, onCancel }: AccommodationFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || '',
    roomNumber: initialData?.roomNumber || '',
    building: initialData?.building || '',
    checkIn: initialData?.checkIn || '',
    checkOut: initialData?.checkOut || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select value={formData.type} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Accommodation Type</SelectLabel>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
              <SelectItem value="Family">Family</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium leading-none">Room Number</div>
        <Input
          id="roomNumber"
          name="roomNumber"
          value={formData.roomNumber}
          onChange={handleChange}
          placeholder="Room number"
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium leading-none">Building</div>
        <Input
          id="building"
          name="building"
          value={formData.building}
          onChange={handleChange}
          placeholder="Building name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium leading-none">Check-in Date</div>
          <Input
            id="checkIn"
            name="checkIn"
            type="date"
            value={formData.checkIn}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium leading-none">Check-out Date</div>
          <Input
            id="checkOut"
            name="checkOut"
            type="date"
            value={formData.checkOut}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}