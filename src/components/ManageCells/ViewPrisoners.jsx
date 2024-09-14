import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import { blue, orange, grey } from "@mui/material/colors";
import { ThemeProvider, createTheme } from "@mui/material";
import Database from "@tauri-apps/plugin-sql";
import { useAtom } from "jotai";
import { headerButtonAtom, currentPrisonerIdAtom } from "../../atom";

const prisonersTemp = ["Joey Diaz", "Nancy Crane"];

function SimpleDialog({ onClose, selectedValue, open, cellNumber, prisoners }) {
  const [buttonSelected, setButtonSelected] = useAtom(headerButtonAtom);
  const [prisonerIdSelected, setPrisonerIdSelected] = useAtom(
    currentPrisonerIdAtom
  );
  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    console.log("VALUE HERE ", value);
    setButtonSelected("prisoners");
    setPrisonerIdSelected(value);

    onClose(value);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#F37D3D",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Prisoners in cell {cellNumber}</DialogTitle>
        <List sx={{ pt: 0 }}>
          {prisoners.map((prisoner) => (
            <ListItem disableGutters key={prisoner.id}>
              <ListItemButton onClick={() => handleListItemClick(prisoner.id)}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: grey[900], color: orange[600] }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={prisoner.firstname} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </ThemeProvider>
  );
}

// SimpleDialog.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   open: PropTypes.bool.isRequired,
//   selectedValue: PropTypes.string.isRequired,
//   cellNumber: PropTypes.string.isRequired,
// };

export default function SimpleDialogDemo({ cellId }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(prisonersTemp[1]);
  const [prisoners, setPrisoners] = React.useState([]);
  const [currentCell, setCurrentCell] = React.useState("");

  const handleClickOpen = async () => {
    const db = await Database.load(
      "mysql://warden:password@localhost/iseage_test1"
    );
    const result = await db.select(
      "SELECT prisoners.* FROM prisoners JOIN prisoner_cells ON prisoners.id = prisoner_cells.prisoner_id WHERE prisoner_cells.cell_id = ?",
      [cellId] // Passing cellId as a parameter
    );
    const cell = await db.select(
      "SELECT cell_number FROM cells WHERE id = ?",
      [cellId] // Pass cellId as parameter
    );
    console.log("FOUND CELL", cell);
    console.log("PRISONERS IN CELL", result);
    setCurrentCell(cell);
    setPrisoners(result); // Set the fetched data in state
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#F37D3D",
      },
    },
  });

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Button variant='outlined' onClick={handleClickOpen}>
          View Prisoners
        </Button>
        <SimpleDialog
          selectedValue={selectedValue}
          open={open}
          onClose={handleClose}
          //@ts-ignore
          cellNumber={currentCell[0]?.cell_number}
          prisoners={prisoners}
        />
      </ThemeProvider>
    </div>
  );
}
