import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import {
  createMemberSchema,
  createVesiosuuskuntaSchema,
} from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GetMember } from '~/shared/types';

type Form = {
  firstName: string;
  lastName: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  phoneNumber?: string;
  email: string;
  paid?: string;
  connectionPointNumber?: string;
  comment?: string;
};

const EMPTY_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  zipCode: '',
  city: '',
  paid: '',
  connectionPointNumber: '',
  phoneNumber: '',
  comment: '',
};

const EMPTY_FORM_ERRORS = EMPTY_FORM_DATA;

export default function EditModal({
  closeModal,
  memberData,
}: {
  closeModal: () => void;
  memberData: GetMember;
}) {
  const [formData, setFormData] = useState<Form>(memberData);
  const [formErrors, setFormErrors] =
    useState<typeof EMPTY_FORM_ERRORS>(EMPTY_FORM_ERRORS);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.CREATE_MEMBER,
    mutationFn: async () =>
      await axios.post(
        `/api/vesiosuuskunta/members/${memberData.uuid}`,
        formData,
      ),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setFormErrors(EMPTY_FORM_ERRORS);
      if (!checkFields()) {
        return;
      }
      await mutateAsync();
    } catch (e) {
      handleError(e);
    }
  }
  function checkFields(): boolean {
    const formParse = createMemberSchema.safeParse(formData);

    if (formParse.success === false) {
      setFormErrors({
        firstName: formParse.error.format().firstName?._errors[0] || '',
        lastName: formParse.error.format().lastName?._errors[0] || '',
        email: formParse.error.format().email?._errors[0] || '',
        city: formParse.error.format().city?._errors[0] || '',
        streetAddress: formParse.error.format().streetAddress?._errors[0] || '',
        zipCode: formParse.error.format().zipCode?._errors[0] || '',
        paid: formParse.error.format().paid?._errors[0] || '',
        connectionPointNumber:
          formParse.error.format().connectionPointNumber?._errors[0] || '',
        phoneNumber: formParse.error.format().phoneNumber?._errors[0] || '',
        comment: formParse.error.format().comment?._errors[0] || '',
      });
      return false;
    }
    return true;
  }

  return (
    <div>
      <div className="fixed top-0 left-0 z-99 h-full w-full bg-black opacity-80"></div>

      <div className="relative grid w-full justify-items-center">
        <div className="absolute bottom-100 z-100 flex flex-col rounded-lg border-4 border-yellow-800 bg-gray-500">
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
            <div className="grid grid-cols-2">
              <InputBlock
                htmlForAndName="firstName"
                inputPlaceholder="Matti"
                labelText="Etunimi"
                isRequired={true}
                errorText={formErrors.firstName}
                setFormData={setFormData}
                inputValue={formData.firstName}
              />
              <InputBlock
                htmlForAndName="lastName"
                inputPlaceholder="Meikäläinen"
                labelText="Sukunimi"
                isRequired={true}
                errorText={formErrors.lastName}
                setFormData={setFormData}
                inputValue={formData.lastName}
              />
              <InputBlock
                htmlForAndName="email"
                inputPlaceholder="matti.meikalainen@email.com"
                labelText="Sähköposti"
                isRequired={true}
                errorText={formErrors.email}
                setFormData={setFormData}
                inputValue={formData.email}
              />
              <InputBlock
                htmlForAndName="phoneNumber"
                inputPlaceholder="045 678 9012"
                labelText="Puhelinnumero"
                errorText={formErrors.phoneNumber}
                setFormData={setFormData}
                inputValue={formData.phoneNumber}
              />
              <InputBlock
                htmlForAndName="streetAddress"
                inputPlaceholder="Mannerheimintie 30"
                labelText="Katuosoite"
                errorText={formErrors.streetAddress}
                setFormData={setFormData}
                inputValue={formData.streetAddress}
              />
              <InputBlock
                htmlForAndName="zipCode"
                inputPlaceholder="00100"
                labelText="Postinumero"
                errorText={formErrors.zipCode}
                setFormData={setFormData}
                inputValue={formData.zipCode}
              />
              <InputBlock
                htmlForAndName="city"
                inputPlaceholder="Helsinki"
                labelText="Postitoimipaikka"
                errorText={formErrors.city}
                setFormData={setFormData}
                inputValue={formData.city}
              />
              <InputBlock
                htmlForAndName="paid"
                inputPlaceholder="1/1/1970"
                labelText="Maksettu"
                errorText={formErrors.paid}
                setFormData={setFormData}
                inputValue={formData.paid}
              />
              <InputBlock
                htmlForAndName="connectionPointNumber"
                inputPlaceholder="K111"
                labelText="Liittymän nro"
                errorText={formErrors.connectionPointNumber}
                setFormData={setFormData}
                inputValue={formData.connectionPointNumber}
              />
              <InputBlock
                htmlForAndName="comment"
                inputPlaceholder="500 metriä putkea kaivettu"
                labelText="Kommenttikenttä"
                errorText={formErrors.comment}
                setFormData={setFormData}
                inputValue={formData.comment}
              />
            </div>
            <div className="mt-5 mb-5 flex justify-center">
              <Button type="submit" className="w-72 min-w-72">
                Muokkaa jäsentä
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  if (text.length > 0) {
    return <p className="text-red-500">{text}</p>;
  }
  return null;
}

function InputBlock({
  htmlForAndName,
  labelText,
  inputPlaceholder,
  isRequired,
  errorText,
  setFormData,
  inputValue,
}: {
  htmlForAndName: string;
  labelText: string;
  inputPlaceholder: string;
  isRequired?: boolean;
  errorText: string;
  setFormData: Dispatch<SetStateAction<Form>>;
  inputValue?: string;
}) {
  return (
    <div className="m-2 grid">
      <label htmlFor={htmlForAndName}>
        {labelText}: {isRequired && <span className="text-red-500">*</span>}
      </label>
      <Input
        name={htmlForAndName}
        placeholder={inputPlaceholder}
        value={inputValue || ''}
        onChange={(e) =>
          setFormData((prevData) => ({
            ...prevData,
            firstName: e.target.value,
          }))
        }
      />
      <ErrorText text={errorText || ''} />
    </div>
  );
}

function FirstNameBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label htmlFor="firstName" className="mr-2">
        Etunimi: <span className="text-red-400">*</span>
      </label>
      <Input
        name="firstName"
        className="m-0"
        placeholder="Matti"
        value={formData.firstName}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            firstName: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.firstName} />
    </div>
  );
}
