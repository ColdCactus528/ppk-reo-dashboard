import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Card from "../components/Card";
import PersonFullCard from "../components/PersonFullCard";
import { fetchPersonById } from "../services/peopleApi";

export default function PersonFull() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: person, isLoading, isError } = useQuery({
    queryKey: ["person", id],
    queryFn: ({ signal }) => fetchPersonById(id, { signal }),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (isLoading) return <Card><div className="text-eco-mute">Загрузка…</div></Card>;
  if (isError || !person) return <Card><div className="text-red-600">Не удалось загрузить карточку</div></Card>;

  return (
    <PersonFullCard
      person={person}
      onOpenRegistry={() => navigate("/registry")}
    />
  );
}
