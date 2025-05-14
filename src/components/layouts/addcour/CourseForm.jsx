import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input"; 
import { Textarea } from "@/components/ui/textarea"; 
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUpload"; 

const CourseForm = ({ onSubmit, onCancel, onPreviewUpdate }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const subscription = watch((value) => {
      onPreviewUpdate(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onPreviewUpdate]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      

      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Nom du cours
        </label>
        <Input
          required
          {...register("title", { required: "Le titre est requis" })}
          className="w-full"
        />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Matière
        </label>
        <Input
          required
          {...register("subject", { required: "La matière est requise" })}
          className="w-full"
        />
        {errors.subject && <span>{errors.subject.message}</span>}
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          classe :
        </label>
        <Input {...register("description")} className="w-full" />
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Image du cours
        </label>
        <ImageUpload
          onImageUpload={(imageUrl, file) => {
            setValue("imageFile", file); // Update the image file
            onPreviewUpdate({ imageUrl });
          }}
        />
      </div>

      <div className="flex gap-4 text-base font-normal text-center mt-8 pt-[25px]">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="text-gray-700 px-[26px] py-[9px] rounded-lg"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-blue-500 text-white px-[25px] py-[9px] rounded-lg"
        >
          Créer le cours
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
