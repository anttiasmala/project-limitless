import { Button } from './Button';
import { Input } from './Input';

export default function CreateVesiosuuskuntaModal() {
  return (
    <div>
      <div className="absolute top-0 left-0 z-99 h-screen w-full bg-black opacity-80"></div>

      <div className="relative grid w-full justify-items-center">
        <div className="absolute z-100 flex w-screen flex-col rounded-lg border-4 border-yellow-800 bg-gray-500 md:w-100">
          <div className="flex justify-end">
            <button className="mt-2 mr-2 hover:text-blue-300">Sulje</button>
          </div>
          <div className="m-1 grid justify-center">
            <label htmlFor="name" className="mr-2">
              Nimi:
            </label>
            <Input name="name" className="m-0" />
          </div>
          <div className="m-1 grid justify-center">
            <label className="mr-2" htmlFor="address">
              Osoite:
            </label>
            <Input className="m-0" />
          </div>
          <div className="m-1 grid justify-center">
            <label className="mr-2">Postinumero:</label>
            <Input className="m-0" />
          </div>
          <div className="m-1 mb-5 grid justify-center">
            <label className="mr-2">Postitoimipaikka:</label>
            <Input className="m-0" />
          </div>
          <div className="mt-5 mb-5 flex justify-center">
            <Button className="w-72 min-w-72">Luo vesiosuuskunta</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
