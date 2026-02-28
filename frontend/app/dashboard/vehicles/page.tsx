"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/context/auth-contexts";
import { carsActions } from "@/app/lib/actions/car.action";
import type { Car, CarCategory, FuelType } from "@/app/lib/api/cars";
import { clearActiveCarId, getActiveCarId, setActiveCarId } from "@/app/lib/active-car";

const CAR_CATEGORIES: CarCategory[] = ["SUV", "SEDAN", "HATCHBACK"];
const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

export default function VehiclesPage() {
  const { token } = useAuth();

  const [cars, setCars] = useState<Car[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [licensePlate, setLicensePlate] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("Petrol");
  const [category, setCategory] = useState<CarCategory>("SUV");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = getActiveCarId();
    if (saved) setActiveId(saved);
  }, []);

  const activeCar = useMemo(() => cars.find((c) => c._id === activeId) || null, [cars, activeId]);

  async function loadCars() {
    if (!token) return;
    try {
      setLoading(true);
      setErr(null);
      const res = await carsActions.listMine(token);
      setCars(res.data);
    } catch (e: any) {
      setErr(e.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function addCar() {
    if (!token) return;
    try {
      setSaving(true);
      setErr(null);

      await carsActions.create(token, {
        make,
        model,
        year,
        licensePlate,
        fuelType,
        category,
      });

      setMake("");
      setModel("");
      setLicensePlate("");
      setFuelType("Petrol");
      setCategory("SUV");

      await loadCars();
    } catch (e: any) {
      setErr(e.message || "Failed to add car");
    } finally {
      setSaving(false);
    }
  }

  async function removeCar(id: string) {
    if (!token) return;
    try {
      setErr(null);
      await carsActions.remove(token, id);

      if (activeId === id) {
        setActiveId("");
        clearActiveCarId();
      }

      await loadCars();
    } catch (e: any) {
      setErr(e.message || "Failed to delete car");
    }
  }

  function selectCar(id: string) {
    setActiveId(id);
    setActiveCarId(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">My Vehicles</h2>
        <p className="text-sm text-slate-500">
          Add your car and select it. Packages will show based on SUV / SEDAN / HATCHBACK.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {err}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Selected car</div>
        <div className="mt-2 text-sm text-slate-600">
          {activeCar ? (
            <>
              <span className="font-semibold text-slate-900">
                {activeCar.make} {activeCar.model} ({activeCar.year})
              </span>{" "}
              • {activeCar.licensePlate} •{" "}
              <span className="font-semibold">{activeCar.category}</span>
            </>
          ) : (
            "No car selected yet."
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Add a car</div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Make (e.g. Toyota)"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Model (e.g. Corolla)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Year (e.g. 2022)"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="License plate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          />

          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
          >
            {FUEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as CarCategory)}
          >
            {CAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addCar}
          disabled={saving || !make || !model || !licensePlate || !year}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
                     hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Car"}
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Your cars</div>

        {loading ? (
          <div className="mt-3 text-sm text-slate-600">Loading…</div>
        ) : cars.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No cars yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {cars.map((c) => {
              const selected = c._id === activeId;
              return (
                <div
                  key={c._id}
                  className={[
                    "flex items-center justify-between gap-3 rounded-xl border p-4",
                    selected ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {c.make} {c.model} ({c.year})
                    </div>
                    <div className="text-sm text-slate-600">
                      {c.licensePlate} • {c.fuelType} •{" "}
                      <span className="font-semibold">{c.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectCar(c._id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {selected ? "Selected" : "Select"}
                    </button>

                    <button
                      onClick={() => removeCar(c._id)}
                      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}