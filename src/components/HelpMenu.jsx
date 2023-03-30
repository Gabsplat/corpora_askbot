import { Button, Menu } from "@mantine/core";
import { Book, BrandGithub, Database } from "tabler-icons-react";

export default function HelpMenu() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button variant="outline" color="teal">
          Links útiles
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          icon={<Book size={18} />}
          onClick={() => {
            window.open(
              "https://docs.google.com/document/d/123p7rfhaoiCvuMxPK3uBJYsWjy4bPh-eZmYIQmr2Bxg/edit?usp=sharing",
              "_blank"
            );
          }}
        >
          Informe
        </Menu.Item>
        <Menu.Item
          icon={<Database size={18} />}
          onClick={() => {
            window.open("https://github.com/Gabsplat/corpora_askbot", "_blank");
          }}
        >
          Repositorio
        </Menu.Item>
        <Menu.Item
          icon={<Database size={18} />}
          onClick={() => {
            window.open(
              "https://docs.google.com/spreadsheets/d/1a-bGGxT7mtc6MT2AXzmSN-Q7YBNnLpfskg1zmliM3KI/edit?usp=sharing",
              "_blank"
            );
          }}
        >
          Base de datos
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
