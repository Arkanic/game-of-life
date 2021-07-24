extern crate wasm_bindgen;

mod utils;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC:wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use std::fmt;
use std::mem;

mod cell;

#[wasm_bindgen]
pub struct Universe {
    width:u32,
    height:u32,
    cells:Vec<cell::Cell>
}

impl Universe {
    fn get_index(&self, row:u32, column:u32) -> usize {
        return (row * self.width + column) as usize;
    }

    pub fn get_cells(&self) -> &[cell::Cell] {
        &self.cells
    }

    pub fn set_cells(&mut self, cells:&[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells[idx] = cell::Cell::Alive;
        }
    }

    fn live_neighbour_count(&self, row:u32, column:u32) -> u8 {
        let mut count = 0;

        let north = if row == 0 {
            self.height - 1
        } else {
            row - 1
        };
        let south = if row == self.height - 1 {
            0
        } else {
            row + 1
        };
        let west = if column == 0 {
            self.width - 1
        } else {
            column - 1
        };
        let east = if column == self.width - 1 {
            0
        } else {
            column + 1
        };

        let nw = self.get_index(north, west);
        count += self.cells[nw] as u8;

        let n = self.get_index(north, column);
        count += self.cells[n] as u8;

        let ne = self.get_index(north, east);
        count += self.cells[ne] as u8;

        let w = self.get_index(row, west);
        count += self.cells[w] as u8;

        let e = self.get_index(row, east);
        count += self.cells[e] as u8;

        let sw = self.get_index(south, west);
        count += self.cells[sw] as u8;

        let s = self.get_index(south, column);
        count += self.cells[s] as u8;

        let se = self.get_index(south, east);
        count += self.cells[se] as u8;

        return count;
    }
}

// public
#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let the_cell = self.cells[idx];
                let live_neighbours = self.live_neighbour_count(row, col);

                let next_cell = match (the_cell, live_neighbours) {
                    (cell::Cell::Alive, x) if x < 2 => cell::Cell::Dead,
                    (cell::Cell::Alive, 2) | (cell::Cell::Alive, 3) => cell::Cell::Alive,
                    (cell::Cell::Alive, x) if x > 3 => cell::Cell::Dead,
                    (cell::Cell::Dead, 3) => cell::Cell::Alive,
                    (otherwise, _) => otherwise
                };

                next[idx] = next_cell;
            }
        }

        self.cells = next;
    }

    pub fn new(width:u32, height:u32) -> Universe {
        utils::set_panic_hook();

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    cell::Cell::Alive
                } else {
                    cell::Cell::Dead
                }
            }).collect();
        
        Universe {
            width,
            height,
            cells
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn set_width(&mut self, width:u32) {
        self.width = width;
        self.cells = (0..width * self.height).map(|_i| cell::Cell::Dead).collect();
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn set_height(&mut self, height:u32) {
        self.height = height;
        self.cells = (0..self.width * height).map(|_i| cell::Cell::Dead).collect();
    }

    pub fn cells(&self) -> js_sys::Uint8Array {
        unsafe {
            let u8_cells = mem::transmute::<&Vec<cell::Cell>, &Vec<u8>>(&self.cells);
            js_sys::Uint8Array::view(&u8_cells)
        }
    }

    pub fn toggle_cell(&mut self, row:u32, column:u32) {
        let idx = self.get_index(row, column);
        self.cells[idx].toggle();
    }
    
    pub fn clear_cells(&mut self) {
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = &mut self.cells[idx];
                cell.toggle();
            }
        }
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f:&mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == cell::Cell::Dead {"0"} else {"1"};
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}