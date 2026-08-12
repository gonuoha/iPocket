import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CollectionFormFieldsProps = {
  idPrefix: string;
  name: string;
  description: string;
  onChange: (patch: { name?: string; description?: string }) => void;
};

export function CollectionFormFields({
  idPrefix,
  name,
  description,
  onChange,
}: CollectionFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(event) => onChange({ name: event.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={3}
        />
      </div>
    </>
  );
}
