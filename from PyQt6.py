from PyQt6.QtGui import QPixmap
from PyQt6 import QtWidgets, QtGui, QtCore
from PyQt6.QtWidgets import QApplication, QWidget, QLabel, QTextEdit, QPushButton, QColorDialog, QFileDialog
from datetime import datetime
import os
import sys
from PyQt6.QtWidgets import *
from PyQt6.QtGui import *
from PyQt6.QtCore import *
from datetime import datetime
from PyQt6.QtWidgets import QApplication, QMainWindow, QMenu
from PyQt6.QtGui import QIcon
from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QMainWindow, QApplication, QVBoxLayout, QWidget, QPushButton, QLabel
from datetime import datetime
import locale
import subprocess

# Changer la locale de l'interpréteur Python
locale.setlocale(locale.LC_TIME, 'fr_FR.UTF-8')

# Définition de la classe principale de l'application
class JournalIntime(QWidget):

    def __init__(self):
        super().__init__()
        # Définition de la taille et du titre de la fenêtre principale
        self.setFixedSize(1200, 600)
        self.setWindowTitle("✧My Pixels✧")


        background_path = "/Users/ahmaide/Downloads/suzume.jpeg"

        # Créer un QLabel et définir l'image de fond
        background = QLabel(self)
        background.setGeometry(0, 0, self.width(), self.height())
        background.setPixmap(QPixmap(background_path))
        background.setScaledContents(True)
        # Création des widgets pour l'entrée de texte et l'affichage de l'image
        self.text = QTextEdit(self)
        self.text.setGeometry(50, 50, 700, 400)
        self.text.setStyleSheet("background-color: rgba(255,255,255,200); border-radius: 10px;border: 2px solid black;")
        self.text.setPlaceholderText("apprécions les moments qui ne reviendront jamais")
        self.photo = QLabel(self)
        self.photo.setGeometry(800, 50, 350, 400)
        self.photo.setStyleSheet("background-color: rgba(0,0,0,0); border-radius: 10px;border: 2px solid black;")
        self.photo.setAlignment(Qt.AlignmentFlag.AlignCenter)
    
        # Création du bouton pour ajouter une photo
        self.photo_button = QPushButton("📸", self)
        self.photo_button.setGeometry(900, 470, 150, 50)
        self.photo_button.setStyleSheet(f"background-color: rgba(255,255,255,1); border-radius: 20px;border: 2px solid black;")
        self.photo_button.clicked.connect(self.add_photo)
        # Création du bouton pour enregistrer l'entrée
        self.save_button = QPushButton("save", self)
        self.save_button.setGeometry(300, 470, 100, 50)
        self.save_button.setStyleSheet(f"background-color: rgba(255,255,255,1); border-radius: 20px;border: 2px solid black;")
        self.save_button.clicked.connect(self.save_entry)



        # Création des boutons de couleur pour décrire votre ressenti de la journée
        self.color_buttons = []
        colors = ["#ff9397", "#fec1be",  "#fee6c3","#b8c5ff", "#d7bdfd"]
        x = 755
        y = 60
        for i, color in enumerate(colors):
            button = QtWidgets.QPushButton("", self)
            button.setStyleSheet(f"background-color: {color}; border-radius: 20px;border: 2px solid black;")
            if color == "#d7bdfd" :
                button.setToolTip("c'est ma couleur pref :)")
            elif color == "#ff9397" :
                button.setToolTip("pas celle la")
            button.setGeometry(x, y, 40, 40)
            self.color_buttons.append(button)
            button.clicked.connect(lambda state, index=i: self.set_text_color(colors[index]))
            y += 50
    # Fonction pour ajouter une photo à l'entrée
    def add_photo(self):
        # Ouverture de la boîte de dialogue pour choisir une photo
        file_path, _ = QFileDialog.getOpenFileName(self, "Choisir une photo", "",
                                                   "Images (*.png *.jpg *.jpeg)")
        if file_path:
            # Ouverture de l'image sélectionnée
            img = QPixmap(file_path)
            # Redimensionnement de l'image pour l'affichage
            img = img.scaled(self.photo.size(), Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
            # Affichage de l'image
            self.photo.setPixmap(img)
            self.photo.adjustSize()

    # Fonction pour enregistrer l'entrée dans un fichier avec la date actuelle
    def save_entry(self):
        # Création du dossier pour la date actuelle s'il n'existe pas déjà
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        day = now.strftime("(%a)")  # Ajout du jour entre parenthèses
        foldername = os.path.join("journal", date + day)
        if not os.path.exists(foldername):
            os.makedirs(foldername)
        # Création du nom de fichier avec la date actuelle
        filename = os.path.join(foldername, date + ".txt")
        # Ouverture du fichier en mode écriture (ou création s'il n'existe pas)
        with open(filename, "a") as file:
            # Ecriture du texte de l'entrée avec un séparateur de date et heure
            date_time = now.strftime("%Y-%m-%d %H:%M:%S")
            file.write("\n" + date_time + "\n")
            text = self.text.toPlainText()
            file.write(text + "\n\n")
            # Ecriture de la photo de l'entrée, si elle existe
            if self.photo.pixmap():
                photo_filename = os.path.join(foldername, date_time + ".jpg")
                self.photo.pixmap().toImage().save(photo_filename, "jpg")
            color = self.text.palette().color(QPalette.ColorRole.Base)
            file.write("Couleur : " + color.name() + "\n\n")
        # Effacement de l'entrée actuelle après l'enregistrement
        self.text.clear()
        self.photo.clear()

    def set_text_color(self, color):
        self.text.setStyleSheet(f"background-color: {color};")

    def choose_background_image(self):
        img=QFileDialog.getOpenFileName(self, "Choisir une photo", "","Images (*.png *.jpg *.jpeg)")
        python = sys.executable
        os.execl(python, python, *sys.argv)

    

            
# Fonction principale pour lancer l'application
if __name__ == '__main__':
    app = QApplication(sys.argv)
    journal = JournalIntime()
    journal.show()
    sys.exit(app.exec())
