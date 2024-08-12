"use client"
import "./globals.css";
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from './firebase'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

export default function Home() {

// -------------------------------------------- State Variables ------------------------------------------

  // variable for our inventory list.
  const[inventory, setInventory] = useState([]);

  // variable for opening our add item modal
  const[open, setOpen] = useState(false);

  // variable for storing and setting the item name.
  const[itemName, setItemName] = useState('');

  // variable for storing and setting the item quantity.
  const[itemQuantity, setItemQuantity] = useState('');

  // variable for storing and setting the item category.
  const[itemCategory, setItemCategory] = useState('');

  // variable for storing the search term.
  const[searchTerm, setSearchTerm] = useState('');

  // variable for storing items that match the search term.
  const[filteredInventory, setFilteredInventory] = useState([]);

// -------------------------------------------- Helper Functions ------------------------------------------

  // function updates inventory if items are added or removed.
  const updateInventory = async () => {

    // get collection of documents/items using query.
    const snapshot = query(collection(firestore, 'inventory'));

    // get documents/items within collection.
    const documents = await getDocs(snapshot);

    // initialize an inventory list to store our items inside.
    const inventoryList = [];

    // add each item into the inventory list.
    documents.forEach((document) => {
      inventoryList.push({
        name: document.id,
        ...document.data(),
      }); 
    });

    // finally, update the inventory with the new inventoryList
    setInventory(inventoryList);
  };

  // function for adding items to inventory.
  const addItem = async (item, category, quantity) => {

    // Standardize items to prevent repeats.
    const standardizedItem = item.trim().toUpperCase();

    // Standardize category to prevent repeats.
    const standardizedCategory = category.trim().toUpperCase();

    // reference the item within the collection.
    const docRef = doc(collection(firestore, 'inventory'), standardizedItem);

    // get the item within the collection.
    const docSnap = await getDoc(docRef);

    // check for item's existence in collection.
    if(docSnap.exists()) {

        // if item already exists, get the item quantity.
        const {quantity: existingQuantity } = docSnap.data();

        // add item quantity to current quantity, and category to database.
        await setDoc(docRef, { quantity: Number(existingQuantity) + Number(quantity), category: standardizedCategory });
    } else {

      // Otherwise, if item does not exist, create a new entry.
        await setDoc(docRef, { quantity, category: standardizedCategory });
    }

    // After adding item, update the inventory.
    await updateInventory();
  };

  // function for removing items from inventory
  const removeItem = async (item) => {

    // Standardize items to prevent repeats
    const standardizedItem = item.trim().toUpperCase();

    // access the item within the collection
    const docRef = doc(collection(firestore, 'inventory'), standardizedItem);

    // get the item within the collection
    const docSnap = await getDoc(docRef);

    // check for item's existence in collection
    if(docSnap.exists()) {
      const { quantity, category } = docSnap.data();

      // if quantity is 1, removing item deletes the item
      if (quantity <= 1) {
        await deleteDoc(docRef);
      } else {
        // if quantity is greater than 1, subtract 1 from the quantity.
        await setDoc(docRef, {quantity: quantity - 1, category: category});
      }
    }

    // After item removal, update the inventory
    await updateInventory();
  };

  // run the updateInventory function when a change in the inventory is detected.
  useEffect(() => { 
    updateInventory();
  }, []);

  // if search is detected, filter the inventory to find matching search terms.
  useEffect(() => {
    if (searchTerm !== '') {
      // if search isn't empty, find items with matching search term.
      const filteredResult = inventory.filter((item) => {
          return item.name.includes(searchTerm) || item.category.includes(searchTerm);
        })
      
      setFilteredInventory(filteredResult);

      // else if item is not found, return the inventory.
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

// -------------------------------------------- Handler Functions ------------------------------------------
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAddItem = () => {
    addItem(itemName, itemCategory, itemQuantity);
    setItemName('');
    setItemQuantity(0);
    setItemCategory('');
    handleClose();
  };

// -------------------------------------------- Webpage ------------------------------------------
return (
    <Box
      width='100dvw'
      height='100dvh'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      gap={2}
      bgcolor={'#fff'}
    >
      
{/* -------------------------------------------- Add Item Modal ------------------------------------------} */}
      <Modal 
        open={open}
        onClose={handleClose}
      >
        <Box
          position='absolute'
          top='50%'
          left='50%'
          width={'70%'}
          bgcolor={'#fff'}
          boxShadow={24}
          p={4}
          display='flex'
          flexDirection='column'
          gap={3}
          sx={{
            transform:'translate(-50%, -50%)'
          }}
        >
          <Typography 
            variant='h4'
            sx={{fontFamily:'Montserrat'}}
          >
            Add Item
          </Typography>
          <Stack
            width='100dvw'
            direction='row'
            spacing={10}
          >
            <TextField
              variant='outlined'
              width='100dvw'
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value.trim().toUpperCase())
              }}
              label='Item Name'
              InputLabelProps= {{
                sx: {fontFamily:'Montserrat'}
              }}
              required
            />
            <TextField
              variant='outlined'
              width='100dvw'
              value={itemCategory}
              onChange={(e) => {
                setItemCategory(e.target.value.trim().toUpperCase())
              }}
              label='Item Category'
              InputLabelProps= {{
                sx: {fontFamily:'Montserrat'}
              }}
              required
            />
            <TextField
              variant='outlined'
              width='100dvw'
              value={itemQuantity}
              type='number'
              onChange={(e) => {setItemQuantity(e.target.value)}}
              label='Item Quantity'
              InputLabelProps= {{
                sx: {fontFamily:'Montserrat'}
              }}
              required
            />
            <Button
              variant='contained'
              onClick={handleAddItem}
              sx={{fontFamily:'Montserrat'}}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
{/* -------------------------------------------- Add Item and Search ------------------------------------------} */}
      <Box
        display='flex'
        flexDirection='row'
        gap={2}
      >
        <Button
          variant='contained'
          onClick={() => {handleOpen()}}
          sx={{fontFamily:'Montserrat'}}
        >
          Add Item
        </Button>
        <TextField
          width='100dvw'
          value={searchTerm}
          type='string'
          onChange={(e) => {setSearchTerm(e.target.value.trim().toUpperCase())}}            
          InputLabelProps= {{
            sx: {fontFamily:'Montserrat'}
          }}
          label='Search For Items'
        />
      </Box>

{/* -------------------------------------------- Main Content ------------------------------------------} */}
      <Box
        bgcolor={'#fff'}
        sx={{borderRadius: '25px'}}
        boxShadow={5}
      >
        <Box
          width='800px'
          height='100px'
          bgcolor='#0B1957'
          display='flex'
          alignItems='center'
          justifyContent='center'
          sx={{borderRadius: '25px 25px 0 0'}}
        >
          <Typography
            variant='h2'
            color='#fff'
            sx={{fontFamily:'Montserrat'}}
          >
            SupplySync
          </Typography>
        </Box>
        <Stack
          width='800px'
          height='300px'
          spacing={2}
          overflow='auto'
        >
          {
            filteredInventory.map(({name, category, quantity}) => {
              return (
              <Box 
                key={name}
                width='100%'
                minHeight='100px'
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                bgcolor={'#fff'}
                padding={5}
                boxShadow={'5'}
              >
                <Typography
                  variant='h6'
                  color={'#000'}
                  textAlign='center'
                  sx={{fontFamily:'Montserrat'}}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant='h6'
                  color={'#000'}
                  textAlign='center'
                  sx={{fontFamily:'Montserrat'}}
                >
                  Category: {category}
                </Typography>
                <Typography
                  variant='h6'
                  color={'#000'}
                  textAlign='center'
                  sx={{fontFamily:'Montserrat'}}
                >
                  Quantity: {quantity}
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => {removeItem(name)}}
                  sx={{fontFamily:'Montserrat'}}
                >
                  Remove
                </Button>
              </Box>
              );
            })
          }
        </Stack>
      </Box>
    </Box>
  );
}