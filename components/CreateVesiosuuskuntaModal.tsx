import { FormEvent, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { createVesiosuuskuntaSchema } from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';

export default function CreateVesiosuuskuntaModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  type Form = {
    name: string;
    streetAddress?: string;
    zipCode?: number | null;
    city?: string;
  };

  const EMPTY_FORM_DATA: Form = {
    name: '',
    streetAddress: '',
    zipCode: null,
    city: '',
  };

  const EMPTY_FORM_ERRORS: Form = {
    name: '',
    streetAddress: '',
    zipCode: '',
    city: '',
  };

  const [formData, setFormData] = useState<Form>(EMPTY_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Form>();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      checkFields();
    } catch (e) {
      handleError(e);
    }
  }
  function checkFields() {
    const formParse = createVesiosuuskuntaSchema.safeParse(formData);
    console.log(formParse);

    if (formParse.success === false) {
      setErrors({
        firstName: validatedForm.error.format().firstName?._errors[0] || '',
        lastName: validatedForm.error.format().lastName?._errors[0] || '',
        email: validatedForm.error.format().email?._errors[0] || '',
        password: validatedForm.error.format().password?._errors[0] || '',
      });
      return;
    }
    //setFormErrors(() => ({ firstName, lastName, email, password }));

    // if some of the fields has failed, return false
    /*
    if (firstName || lastName || email || password) {
      return false;
    }
    */
    return true;
  }

  return (
    <div>
      <div className="absolute top-0 left-0 z-99 h-screen w-full bg-black opacity-80"></div>

      <div className="relative grid w-full justify-items-center">
        <div className="absolute z-100 flex w-screen flex-col rounded-lg border-4 border-yellow-800 bg-gray-500 md:w-100">
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="flex justify-end">
              <button
                className="mt-2 mr-2 hover:text-blue-300"
                onClick={() => closeModal()}
                type="button"
              >
                Sulje
              </button>
            </div>
            <div className="m-1 grid justify-center">
              <label htmlFor="name" className="mr-2">
                Nimi: <span className="text-red-400">Pakollinen</span>
              </label>
              <Input
                name="name"
                className="m-0"
                placeholder="Meikäläisen vesiosuuskunta"
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    name: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="m-1 grid justify-center">
              <label className="mr-2" htmlFor="streetAddress">
                Osoite:
              </label>
              <Input
                name="streetAddress"
                className="m-0"
                placeholder="Mannerheimintie 30"
                value={formData.streetAddress}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    streetAddress: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="m-1 grid justify-center">
              <label htmlFor="zipCode" className="mr-2">
                Postinumero:
              </label>
              <Input
                name="zipCode"
                className="m-0"
                placeholder="00100"
                value={formData.zipCode}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    zipCode: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="m-1 mb-5 grid justify-center">
              <label className="mr-2" htmlFor="city">
                Postitoimipaikka:
              </label>
              <Input
                name="city"
                className="m-0"
                placeholder="Helsinki"
                value={formData.city}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    city: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-center">
              <Button type="submit" className="w-72 min-w-72">
                Luo vesiosuuskunta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
